import os
import json
from datetime import datetime, timedelta
from anthropic import Anthropic
from pathlib import Path

def get_recent_meals():
    """Get the last two weeks of meals from next_week.json files."""
    next_week_file = Path("data/next_week.json")
    if not next_week_file.exists():
        return [{}]
    
    with open(next_week_file) as f:
        return json.load(f)

def generate_meal_plan():
    """Generate a new meal plan using Claude."""
    # Initialize client with API key from environment
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    # Load prompt template
    with open("data/prompt.txt") as f:
        prompt_template = f.read()
    
    # Get and format recent meals
    recent_meals = get_recent_meals()
    prompt = prompt_template % json.dumps(recent_meals, indent=2)

    message = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1000,
        temperature=0.2,  # Lower temperature for more consistent output
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return json.loads(message.content[0].text)

def save_meal_plan(meal_plan):
    """Save the meal plan to both dated and next_week files."""
    # Create data directory if it doesn't exist
    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)

    # Save with date
    date_str = datetime.now().strftime("%Y%m%d")
    dated_file = data_dir / f"meal_plan_{date_str}.json"
    with open(dated_file, 'w') as f:
        json.dump(meal_plan, f, indent=2)

    # Save as next_week.json
    next_week_file = data_dir / "next_week.json"
    with open(next_week_file, 'w') as f:
        json.dump(meal_plan, f, indent=2)


meal_plan = generate_meal_plan()
save_meal_plan(meal_plan)
