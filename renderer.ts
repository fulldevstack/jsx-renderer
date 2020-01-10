/**
 * This is a *very* simple jsx factory for typescript to transpile jsx
 * It was fun to put together but I don't see myself substituting this for react any time soon
 * I created this as both a learning experience and because the assignment specifically stated not to use libraries
 */
namespace Renderer {
  /* Only supports functional components */
  export type FunctionComponent<P> = ((props: P) => JSXElement | null)
  export interface JSXElement<P = any, T extends string | FunctionComponent<any> = string | FunctionComponent<any>> {
    type: T;
    props: P;
  }
  /* This interface could could be greatly expanded upon */
  export interface AttributeCollection {
    [name: string]: string | boolean | EventListenerOrEventListenerObject;
  }

  /**
   * The jsxFactory to be used by the typescript compiler
   * Essentially, every time the compiler encounters JSX it will process
   * it with this factory function instead of calling React.createElement.
   * This allows the usage of JSX without having to depend on React or any other library
   * For more details see [TS Docs](https://www.typescriptlang.org/docs/handbook/jsx.html)
   * @param tag
   * @param props
   * @param children
   */
  export function createElement(tag: string | FunctionComponent<any>,
                                props: AttributeCollection | null,
                                ...children: any[]): Node | DocumentFragment | JSXElement | null {
    if (typeof tag === 'function') { // Component
      return tag({...props, children}) as JSXElement;
    }

    let element
    if (tag === 'fragment') { // Fragment
      element = document.createDocumentFragment();
    } else { // DOM Element
      element = document.createElement(tag);
      mapProps(element, props);
    }

    for (const child of children) {
      appendChild(element, child);
    }
    return element;
  }

  /**
   * Map props to their respective attributes or events
   *
   * @param element - the element to set attributes and event listeners on
   * @param props - the props to be mapped to attributes and events
   */
  function mapProps(element: Element, props: any) {
    if (props) {
      for (const key of Object.keys(props)) {
        const attributeValue = props[key];

        if (key === 'className') { // JSX does not allow class as a valid name
          element.setAttribute('class', attributeValue as string);
        } else if (key.startsWith('on') && typeof props[key] === 'function') { // Event Listener
          element.addEventListener(key.substring(2), attributeValue as EventListenerOrEventListenerObject);
        } else if (key === 'style') { // Map Style to a string
          const style = Object.entries(attributeValue).reduce(
            (acum, [key, val]) => `${acum}${key}:${val};`,
            '',
          );
          element.setAttribute('style', style);
        } else {
          // <input disable />      { disable: true }
          // <input type="text" />  { type: "text"}
          if (typeof attributeValue === 'boolean' && attributeValue) {
            element.setAttribute(key, '');
          } else {
            element.setAttribute(key, `${attributeValue}`);
          }
        }
      }
    }
  }
  /**
   * Append child to parent.
   * Create text Node in the case of a string,
   * Recurse in the case of an array
   * @param parent
   * @param child
   */
  function appendChild(parent: Node, child: any) {
    if (typeof child === 'undefined' || child === null) {
      return;
    }

    if (Array.isArray(child)) {
      for (const value of child) {
        appendChild(parent, value);
      }
    } else if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      parent.appendChild(child);
    } else if (child === false) {
      // <>{condition && <a>Display when condition is true</a>}</>
      // if condition is false, the child is a boolean, but we don't want to display anything
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
}
/**
 * Declare the JSX namespace in global scope for the Typescript compiler
 * Supposedly this doesn't have to go in global scope but I couldn't get tsc to pick
 * it up otherwise and I didn't want to spend too much time on it
 */
declare global {
  /**
   * This is a very minimal JSX interface.
   * Making it more robust would provide stronger type safety
   */
  namespace JSX {
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [elemName: string]: any;
      fragment: any;
    }
  }
}

export default Renderer;