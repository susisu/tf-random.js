# tf-random.js
Pure JavaScript port of [tf-random](http://hackage.haskell.org/package/tf-random-0.5), splittable pseudorandom number generator.

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

## License
[MIT License](http://opensource.org/licenses/mit-license.php)

## Author
Susisu ([GitHub](https://github.com/susisu), [Twitter](https://twitter.com/susisu2413))
