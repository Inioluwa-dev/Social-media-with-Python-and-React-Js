import { useState } from "react";
export default function Copy() {
    const [date, setDate] = useState(new Date())


    let year = date.getFullYear()
    return(
        <footer>
           <p> &copy; {year} Kefi Student App</p>
        </footer>
    );

}

