<a name="1.3.2"></a>
## [1.3.2](https://github.com/aurelia/task-queue/compare/1.3.1...1.3.2) (2019-01-18)

* Add module field to package.json

<a name="1.3.1"></a>
## [1.3.1](https://github.com/aurelia/task-queue/compare/1.3.0...1.3.1) (2018-06-18)

### Performance Improvements

* Improved internal micro task queue flush initiation.

<a name="1.3.0"></a>
# [1.3.0](https://github.com/aurelia/task-queue/compare/1.2.1...1.3.0) (2018-05-08)

### Bug Fixes

* Removed setImmediate error handling code which was not compatible with Electron.

<a name="1.2.1"></a>
## [1.2.1](https://github.com/aurelia/task-queue/compare/1.2.0...v1.2.1) (2017-10-01)


### Performance Improvements

* **index:** remove capacity defined check ([ef6c4b8](https://github.com/aurelia/task-queue/commit/ef6c4b8))
* Internal refactoring to reduce code duplication

<a name="1.2.0"></a>
# [1.2.0](https://github.com/aurelia/task-queue/compare/1.1.0...v1.2.0) (2017-02-21)


### Features

* **index:** provide public api for enabling long stack traces ([352f50b](https://github.com/aurelia/task-queue/commit/352f50b))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/aurelia/task-queue/compare/1.0.0...v1.1.0) (2016-09-29)


### Features

* **TaskQueue:** expose flushing status ([fdf0bd7](https://github.com/aurelia/task-queue/commit/fdf0bd7))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/aurelia/task-queue/compare/1.0.0-rc.1.0.0...v1.0.0) (2016-07-27)



<a name="1.0.0-rc.1.0.0"></a>
# [1.0.0-rc.1.0.0](https://github.com/aurelia/task-queue/compare/1.0.0-beta.2.0.1...v1.0.0-rc.1.0.0) (2016-06-22)



### 1.0.0-beta.1.2.1 (2016-05-10)


### 1.0.0-beta.1.2.0 (2016-03-22)

* Update to Babel 6

### 1.0.0-beta.1.1.1 (2016-02-08)


#### Bug Fixes

* **index:** rename Callable to Task ([5e5e3a96](http://github.com/aurelia/task-queue/commit/5e5e3a96ee4da108310ad3e651f31ebd06f339dd))


### 1.0.0-beta.1.1.0 (2016-01-29)


#### Bug Fixes

* **index:** enable running without mutation observers ([7d0c1336](http://github.com/aurelia/task-queue/commit/7d0c133647f06f0ce81b833342f514f567c9f8b1), closes [#10](http://github.com/aurelia/task-queue/issues/10))
* **package:** correct missed dependency update ([896972b3](http://github.com/aurelia/task-queue/commit/896972b36c814e0140c7f4106586ab0866099517))


#### Features

* **all:** update jspm meta; core-js; aurelia deps ([38b78a66](http://github.com/aurelia/task-queue/commit/38b78a66c643d0056efdcd0abf5a0ac0a83a3b84))


### 1.0.0-beta.1 (2015-11-16)


## 0.9.0 (2015-11-10)


#### Bug Fixes

* **task-queue:** queue can be effectively overflown ([9a8f7583](http://github.com/aurelia/task-queue/commit/9a8f7583b06ff0295a7f5a41ffec9dd7bcf02755), closes [#7](http://github.com/aurelia/task-queue/issues/7))


## 0.8.0 (2015-10-13)


#### Bug Fixes

* **all:** update compiler ([c7718a62](http://github.com/aurelia/task-queue/commit/c7718a62eaff54f6e788074704dcb51a1e44e39c))
* **build:**
  * update linting, testing and tools ([8c213d11](http://github.com/aurelia/task-queue/commit/8c213d1122f24724dc7d5194752b4e30fe32aca5))
  * add missing bower bump ([fdb2fe41](http://github.com/aurelia/task-queue/commit/fdb2fe41aa643670516db855731ef18c9050661c))
* **index:** streamline public api by making onError private ([1773f049](http://github.com/aurelia/task-queue/commit/1773f04960bcafc7881e3fece9072eff4394332e))
* **package:** change jspm directories ([fba51f23](http://github.com/aurelia/task-queue/commit/fba51f234b61e0127fd8bb29ce960964167e57b0))


#### Features

* **all:**
  * integrate PAL ([9076bd94](http://github.com/aurelia/task-queue/commit/9076bd948b07899f34bae7b3c69a5ed16df14f8a))
  * add more type info ([7ba861b8](http://github.com/aurelia/task-queue/commit/7ba861b89bf64900d82b632f2d68475bce75e616))
* **build:** update compiler and switch to register module format ([2b35396c](http://github.com/aurelia/task-queue/commit/2b35396cbc4730efae751bc360bf1fe29bad2527))
* **docs:** generate api.json from .d.ts file ([a05008a5](http://github.com/aurelia/task-queue/commit/a05008a5482cedf53583b206a97c02e9ed6c49a3))


## 0.7.0 (2015-09-04)


#### Bug Fixes

* **build:** update linting, testing and tools ([8c213d11](http://github.com/aurelia/task-queue/commit/8c213d1122f24724dc7d5194752b4e30fe32aca5))


#### Features

* **docs:** generate api.json from .d.ts file ([a05008a5](http://github.com/aurelia/task-queue/commit/a05008a5482cedf53583b206a97c02e9ed6c49a3))


### 0.6.2 (2015-08-14)


#### Features

* **all:** add more type info ([7ba861b8](http://github.com/aurelia/task-queue/commit/7ba861b89bf64900d82b632f2d68475bce75e616))


### 0.6.1 (2015-07-29)

* improve output file name

## 0.6.0 (2015-07-02)


## 0.5.0 (2015-06-08)


## 0.4.0 (2015-04-30)

**all:** update compilation process


## 0.3.0 (2015-04-09)


#### Bug Fixes

* **all:** update compiler ([c7718a62](http://github.com/aurelia/task-queue/commit/c7718a62eaff54f6e788074704dcb51a1e44e39c))


### 0.2.5 (2015-02-28)


#### Bug Fixes

* **package:** change jspm directories ([fba51f23](http://github.com/aurelia/task-queue/commit/fba51f234b61e0127fd8bb29ce960964167e57b0))


### 0.2.4 (2015-02-28)


#### Bug Fixes

* **build:** add missing bower bump ([fdb2fe41](http://github.com/aurelia/task-queue/commit/fdb2fe41aa643670516db855731ef18c9050661c))


### 0.2.3 (2015-02-03)

* Performance improvements.

### 0.2.2 (2015-01-22)

* Update compiler.

### 0.2.1 (2015-01-12)

* Update compiled output.

## 0.2.0 (2015-01-06)


#### Features

* **build:** update compiler and switch to register module format ([2b35396c](http://github.com/aurelia/task-queue/commit/2b35396cbc4730efae751bc360bf1fe29bad2527))
