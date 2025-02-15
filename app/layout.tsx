import Header from '@/components/Header';
import React from "react";

type MyComponentProps = React.PropsWithChildren<{}>;

export default function RootLayout({ children, ...other}: MyComponentProps) {
  return (
      <div>
        <Header {...other}/>
        {children}
      </div>
  );
}
// import Button from "./Styles";


// export default function MyComponent({ children, ...other}: MyComponentProps) {
//   return <Button {...other}>{children}</Button>;
// }