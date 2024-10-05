export { Print, StringByte, StringLen, TableLen, TableSort };

const Print = {
  call(vm) {
    const arg = vm.stack.pop();
    console.log(arg);
  },
};

const StringByte = {
  call(vm) {
    const idx = vm.stack.pop() - 1; // Lua indices start at 1
    const s = vm.stack.pop();
    vm.stack.push(s[idx]);
  },
};

const StringLen = {
  call(vm) {
    const s = vm.stack.pop();
    vm.stack.push(s.length);
  },
};

const TableLen = {
  call(vm) {
    // The length operator for tables in Lua returns a `border`, where a border is a sequence of
    // natural numbers followed by a nil value. E.g, {10, 20, 30, nil, 50} has borders at 3 and 5.
    // The length operator will return one of those, our implementation will return the smallest
    // border, at the cost of a O(n log n) implementation instead of O(log n) as in Lua.
    const table = vm.stack.pop();
    const integerKeys = [];
    for (let key of Object.getOwnPropertyNames(table)) {
      const asInt = parseFloat(key);
      if (Number.isInteger(asInt)) {
        integerKeys.push(asInt);
      }
    }
    integerKeys.sort();
    for (let i = 0; i < integerKeys.length; ++i) {
      if (integerKeys[i] + 1 != integerKeys[i + 1]) {
        vm.stack.push(integerKeys[i]);
        return;
      }
    }
    vm.stack.push(integerKeys.at(-1));
  },
};

const TableSort = {
  call(vm) {
    // The length operator for tables in Lua returns a `border`, where a border is a sequence of
    // natural numbers followed by a nil value. E.g, {10, 20, 30, nil, 50} has borders at 3 and 5.
    // The length operator will return one of those, our implementation will return the smallest
    // border, at the cost of a O(n log n) implementation instead of O(log n) as in Lua.
    const table = vm.stack.pop();
    const integerKeys = [];
    const values = [];
    for (let key of Object.getOwnPropertyNames(table)) {
      const asInt = parseFloat(key);
      if (Number.isInteger(asInt)) {
        integerKeys.push(asInt);
      }
    }
    integerKeys.sort();
    let maxKey = integerKeys.at(-1);
    for (let i = 0; i < integerKeys.length; ++i) {
      if (integerKeys[i] + 1 != integerKeys[i + 1]) {
        maxKey = integerKeys[i];
        break;
      }
    }
    for (let i = 1; i <= maxKey; ++i) {
      values.push(table[i]);
    }
    values.sort();
    for (let i = 1; i <= maxKey; ++i) {
      table[i] = values[i - 1];
    }
  },
};
