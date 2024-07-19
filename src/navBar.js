// Create the nav element
const navBar= document.createElement('nav')

// Specify the class of the nav
const navBarClass = 'navbar'
navBar.className = navBarClass

// navBar HTML code
const navBarHTML = `
        <ul class="links">
            <li><a href="index.html">Home</a></li>
            <li><a href="cv.html">Curriculum Vitae</a></li>
            <li><a href="js.html">JavaScript Challenge</a></li>
            <li><a href="contact.html">Contact</a></li>
        </ul>
        <div class="toggle-button">
            <label for="menu-toggle">
                <img src="./assets/menu.svg" alt="menu" class="menu-button">
            </label>
            <input type="checkbox" id="menu-toggle">
        </div>
    </nav>  

    <ul class="dropdown">
        <li><a href="index.html">Home</a></li>
        <li><a href="cv.html">Curriculum Vitae</a></li>
        <li><a href="js.html">JavaScript Challenge</a></li>
        <li><a href="contact.html">Contact</a></li>
    </ul>
`
// Specify the HTML of the nav
navBar.innerHTML = navBarHTML

// Append to the end the navBar HTML to the NavBar class
// Get first element of the array (there will only be one body)
document.getElementsByTagName('body')[0].prepend(navBar)