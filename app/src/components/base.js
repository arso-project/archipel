import * as R from 'rebass'
import styled from 'styled-components'

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

export const CustomButton = styled(R.Button)`
  border: 3px solid red;
`

// Rebass default re-exports.
// List created with:
// console.log(Object.keys(R).sort().map((k) => `export const ${k} = R.${k}`).join('\n'))

export const Absolute = R.Absolute
export const Arrow = R.Arrow
export const Avatar = R.Avatar
export const BackgroundImage = R.BackgroundImage
export const Badge = R.Badge
export const Banner = R.Banner
export const Base = R.Base
export const BlockLink = R.BlockLink
export const Blockquote = R.Blockquote
export const Border = R.Border
export const Box = R.Box
// export const Button = R.Button
export const ButtonCircle = R.ButtonCircle
export const ButtonOutline = R.ButtonOutline
export const ButtonTransparent = R.ButtonTransparent
export const CSS = R.CSS
export const Caps = R.Caps
export const Card = R.Card
export const Carousel = R.Carousel
export const Checkbox = R.Checkbox
export const Circle = R.Circle
export const Close = R.Close
export const Code = R.Code
export const Column = R.Column
export const Container = R.Container
export const DarkMode = R.DarkMode
export const Divider = R.Divider
export const Donut = R.Donut
export const Dot = R.Dot
export const Drawer = R.Drawer
export const Embed = R.Embed
export const Fixed = R.Fixed
export const Flex = R.Flex
export const Group = R.Group
export const Heading = R.Heading
export const Image = R.Image
export const Input = R.Input
export const Label = R.Label
export const Lead = R.Lead
export const Link = R.Link
export const Measure = R.Measure
export const Message = R.Message
export const Modal = R.Modal
export const NavLink = R.NavLink
export const Overlay = R.Overlay
export const Panel = R.Panel
export const Position = R.Position
export const Pre = R.Pre
export const Progress = R.Progress
export const Provider = R.Provider
export const Radio = R.Radio
export const Relative = R.Relative
export const Root = R.Root
export const Row = R.Row
export const Samp = R.Samp
export const Select = R.Select
export const Slider = R.Slider
export const Small = R.Small
export const Sticky = R.Sticky
export const Subhead = R.Subhead
export const Switch = R.Switch
export const Tab = R.Tab
export const Tabs = R.Tabs
export const Text = R.Text
export const Textarea = R.Textarea
export const Toolbar = R.Toolbar
export const Tooltip = R.Tooltip
export const Truncate = R.Truncate
export const colors = R.colors
export const createColors = R.createColors
export const invertTheme = R.invertTheme
export const theme = R.theme
