# Roll Your Own React Experiment
As part of a challenge and as a way to learn more about jsx, I created my own little react renderer.
It is in no way a replacement for react but it was fun to put together and educational.

## Usage
Simply add the `renderer.ts` file into your `src`  directory and be sure to set the 
`jsx` and `jsxFactory` options in your tsconfig like in this repository. Lastly, in your .tsx 
file just be sure to import `import Renderer from '../renderer.js'` and you are free to use 
functional style jsx components without react. All you need is typescript and tsc will handle the rest.