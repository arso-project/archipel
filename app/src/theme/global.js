
import { injectGlobal } from 'styled-components'

// Inject required global styles.
const authenticPath = 'fonts/authentic_sans/AUTHENTIC-Sans'
const globalStyles = () => injectGlobal`
  ${'' /* @font-face {
    font-family: 'authentic';
    src: url('${authenticPath}.eot');
    src: url('${authenticPath}.eot?#iefix') format('embedded-opentype'),
         url('${authenticPath}.woff') format('woff'),
         url('${authenticPath}.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  } */}
  * { box-sizing: border-box; }
  body { 
    margin: 0; 
    width: 100vw; 
    overflow-x: hidden; 
    font-family: "Inter UI", sans-serif;
  }
`

const interUI = () => injectGlobal`
  @font-face {
    font-family: 'Inter UI';
    font-style:  normal;
    font-weight: 400;
    src: url("Inter-UI-Regular.woff2") format("woff2"),
        url("Inter-UI-Regular.woff") format("woff");
  }
  @font-face {
    font-family: 'Inter UI';
    font-style:  italic;
    font-weight: 400;
    src: url("Inter-UI-Italic.woff2") format("woff2"),
        url("Inter-UI-Italic.woff") format("woff");
  }

  @font-face {
    font-family: 'Inter UI';
    font-style:  normal;
    font-weight: 500;
    src: url("Inter-UI-Medium.woff2") format("woff2"),
        url("Inter-UI-Medium.woff") format("woff");
  }
  @font-face {
    font-family: 'Inter UI';
    font-style:  italic;
    font-weight: 500;
    src: url("Inter-UI-MediumItalic.woff2") format("woff2"),
        url("Inter-UI-MediumItalic.woff") format("woff");
  }

  @font-face {
    font-family: 'Inter UI';
    font-style:  normal;
    font-weight: 700;
    src: url("Inter-UI-Bold.woff2") format("woff2"),
        url("Inter-UI-Bold.woff") format("woff");
  }
  @font-face {
    font-family: 'Inter UI';
    font-style:  italic;
    font-weight: 700;
    src: url("Inter-UI-BoldItalic.woff2") format("woff2"),
        url("Inter-UI-BoldItalic.woff") format("woff");
  }

  @font-face {
    font-family: 'Inter UI';
    font-style:  normal;
    font-weight: 900;
    src: url("Inter-UI-Black.woff2") format("woff2"),
        url("Inter-UI-Black.woff") format("woff");
  }
  @font-face {
    font-family: 'Inter UI';
    font-style:  italic;
    font-weight: 900;
    src: url("Inter-UI-BlackItalic.woff2") format("woff2"),
        url("Inter-UI-BlackItalic.woff") format("woff");
  }

`

export default () => {
  interUI()
  globalStyles()
}
