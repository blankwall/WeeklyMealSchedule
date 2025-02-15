import os

cmd = "scp -r {} joel@192.168.68.108:/home/joel/weekly-meals/{}"

files = [
	"pages",
	"pages/next",
	"pages/api",
	"data",
	"app",
	"recipes/",
]

path = "/Users/tylerbohan/Documents/meals_2025/weekly-meal-schedule/"
for i in files:
	npath = path+i
	ncmd = cmd.format(npath,i)
	os.system(ncmd)

