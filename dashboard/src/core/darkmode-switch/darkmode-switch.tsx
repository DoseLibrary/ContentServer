import { useEffect, useState } from 'react';
import { MdModeNight   , MdSunny } from 'react-icons/md';

const DarkmodeSwitch = () => {

    const [theme, setTheme] = useState(localStorage.theme);
    const colorTheme = theme == 'dark' ? 'light' : 'dark';

    const [darkSide, setDarkSide] = useState(colorTheme === 'light' ? true : false);

    useEffect(()=>{
        localStorage.theme = theme;
    }, [theme])

    const root = window.document.documentElement;
    root.classList.remove(colorTheme);
    root.classList.add(theme);

    
    const toggleDarkMode = (event: React.ChangeEvent<HTMLInputElement>) => {
            const checked = event.target.checked;
            setDarkSide(checked);
            setTheme(checked ? 'dark' : 'light');
            root.classList.remove(colorTheme);
            root.classList.add(theme);
    
            // save theme to local storage
            localStorage.theme = theme;
    };

    return (
        <div className="fixed top-4 right-4">
            <label htmlFor="light-switch" className="text-yellow-400">
                <MdSunny className="hidden dark:block" />
                <MdModeNight  className='block dark:hidden' />
            </label>
            <input id='light-switch' type="checkbox" name="light-switch" className="hidden" checked={darkSide} onChange={toggleDarkMode} />
        </div>
    );
}

export default DarkmodeSwitch;
