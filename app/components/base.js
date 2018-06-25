import R from 'rebass'
import styled from 'styled-components'

// export const CustomButton = Button.extend`
//     background-color: "#000"
// `

export * from 'rebass'

const c = (color) => (props) => props.theme.colors[color]

export const Button = styled(R.Button)`
  background-color: ${c('primary')};
  cursor: pointer;
  &:focus, &:active, &:hover {
      outline: 0;
      box-shadow: none;
  }
  &:hover {
      background-color: ${c('primary2')}
  }
`

export const BrightButton = styled(Button)`
  background-color: ${c('white')};
  color: ${c('primary')};
  &:hover {
    background-color: ${c('grey1')}
  }
`
