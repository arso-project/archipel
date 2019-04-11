export default function deepEqual (a, b) {
  // if (a !== b) return false // unequal by reference

  // according to http://www.mattzeunert.com/2016/01/28/javascript-deep-equal.html
  // the following is faster than module deep-equal https://github.com/substack/node-deep-equal/
  // so subject to high quality optimization
  let sa = JSON.stringify(a)
  let sb = JSON.stringify(b)

  if (sa !== sb) return false

  return true
}