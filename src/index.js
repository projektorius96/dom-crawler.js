// User-defined configs
let color = ['red', 'orange', 'yellow', 'green', 'blue', 'magenta']; // some colors

// Node.js built-in
const path = require('path');
const fsPromises = require('fs/promises');

// Express.js
const express = require('express');
const app = express();
const [PORT, PATH] = [8181, '../public/index.html']; // or any other relative PORT, PATH available

// VENDORS (3rd-parties)

// ~ HTTP-TERMINATOR [by Gajus Kuizinas]
const {createHttpTerminator} = require('http-terminator');
const server = app.listen(PORT);
const httpTerminator = createHttpTerminator({
  server,
});

// ~ JSDOM + [optionally] -> node-html-parser
const JSDOM = require("jsdom").JSDOM;
/* const parser = require('node-html-parser'); // (^this is simplified light-weight alternative for JSDOM) */
const options = {
  resources: 'usable', /* run external (sub)resources such as: scripts, frames etc. */
  runScripts: 'dangerously', /* run internal resources within <script></script> tags */
};

let file_handle = null;
async function scrapper() {

    /* app.use(express.urlencoded({ extended: false })); // # optional herein */
    console.log(path.join(__dirname, '../public'))
    app.use(express.static(path.join(__dirname, '../public')/* , {index: false} */));

    const dom = await JSDOM.fromFile(PATH, null /* options */); /* console.log("JSDOM reference", dom); */
    /* console.log("HTML content before append: ", dom.serialize()); */ // as if document.body.parentElement on user-agent (browser)
    /* const root = parser.parse(dom.serialize()); console.log("output of parser.parse (root): ", root) // # (^see for caret) */
    
        color.map(val=>

        dom.window.document.querySelector('body')
        .insertAdjacentHTML(
          'beforeend', `\r\n<h3 style="background-color: ${val}">Greetings from Node.js (Powered by npm jsdom).</h3>\r\n`
        ) 

        )
    
    let serializedDOM = dom.serialize();
    /* console.log("HTML content after append: ", serializedDOM); */

    /* 
    const file = await fsPromises.readFile('./public/index.html', {encoding: "utf-8"}); 
    console.log("current files content is: ", file); 
    */

    try {
      
      /* NOTE : must explicitly change default flag of "r" to e.g. "r+" // # reference : @https://nodejs.org/api/fs.html#fs_file_system_flags */
      file_handle = await fsPromises.open(PATH, "r+");

      // console.log("file_handle's idiomatic file_descriptor (fd) is: ", file_handle.fd /* file_handle.fd === 3 */); 

      fsPromises.writeFile(file_handle, serializedDOM);

    }
    catch(file_handle_error) {
      console.error(file_handle_error);
    }
    finally{
      await file_handle.close();
    }

    // ~ HTTP-TERMINATOR [CONT'D]
    await httpTerminator.terminate()

    return `Server is running...
    NOTE : you can always terminate static file serving with Ctrl + C (Windows)
    `;
   
} 
scrapper()
  .then(console.log)
  .catch(console.error)
  .finally();

console.log(
`

Express server started : open the client (app) on the default user-agent (browser) consuming the following URL:

http://localhost:${PORT}

`
)

/* process.kill(0) */ // if no process - error will be thrown , otherwise process de facto | this time no error [PASSED]


// NEXT GOAL : integrate the following for Express.js : @https://github.com/gajus/http-terminator by Gajus
// BONUS consider this npm : @https://www.npmjs.com/package/livereload
 
