# tf-random.js
Pure JavaScript port of [tf-random](http://hackage.haskell.org/package/tf-random-0.5), splittable pseudorandom number generator.

## Installation
``` shell
# npm
npm i @susisu/tf-random
# yarn
yarn add @susisu/tf-random
```

## Usage
``` javascript
import { TFGen } from "@susisu/tf-random";

// Initialize a generator.
const gen = TFGen.init();

// Call `next` to generate a random value (32-bit signed integer) and a new generator.
const [x, nextGen] = gen.next();

// Call `split` to derive two effectively independent generators.
const [gen1, gen2] = nextGen.split();
```

You can call `gen.splitn(n, i)` to derive `2 ** n` independent generators and obtain `i`th of them.

The package also provides some utility functions `random`, `randomInt32`, `randomInt32R`, etc. for generating random numbers.

## License
[MIT License](http://opensource.org/licenses/mit-license.php)

## Author
Susisu ([GitHub](https://github.com/susisu), [Twitter](https://twitter.com/susisu2413))
