/**
 * Created by zhangran on 16/6/2.
 */

import dep from "./dep";

/**
 * 封装 computed => class, 添加计算属性读取器
 * @param computed computed options
 * @param MY MY Class
 * @returns {Computed} Class extends Data...
 */

export default function (computed, MY) {

  let C1 = getComputedClass(MY, computed, true);
  let C2 = getComputedClass(MY, computed, false, new C1());

  return C2;
}

/**
 * 计算表达式 => Class
 * @param ComputedClass 类
 * @param computed option computed
 * @param addDep 是否注册依赖
 * @param self this指向
 * @returns {*}
 */

function getComputedClass(ComputedClass, computed, addDep, self) {

  for (let item in computed) {
    let _val, _deps = [];
    class ComputedNoop extends ComputedClass {
      constructor() {
        super();
        dep.now = {
          name: item,
          fn: computed[item]
        };
        let _this;
        if (self) {
          _this = self;
        } else {
          _this = this;
        }
        this[item] = _val = computed[item].call(_this);
        dep.now = null;
        if (!addDep) {
          this.$on('add-dep', name => {
            for (let innerItem in computed) {
              dep.now = {
                name: innerItem,
                fn: computed[innerItem]
              };
              computed[innerItem].call(self)
              dep.now = null;
            }
          })
        }
      }

      get [item]() {

        dep.plusDeps(_deps);

        return _val;
      }

      set [item](value) {
        if (value === _val) {
          return;
        }
        _val = value;

        dep.emitDeps.call(this, _deps)
      }

    }

    ComputedClass = ComputedNoop;
  }

  return ComputedClass;
}