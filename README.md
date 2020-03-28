# test-yarn-pkg-versions

This repository is for re-producing a problem with `yarn` that more than 1 version of a package can exist in the project, when there is actually 1 package that could satisfy the version spec.

## How to reproduce the problem

* The `yarn.lock` attached in this project is created with the following command. You can delete `yarn.lock`, and run the following command to rebuild it.
    ```powershell
    yarn add --dev typescript @types/webpack@4.41.2 @types/webpack-dev-server
    ```
* Alternatively, run `yarn install` in the root folder directly.
  
* Now you should be able to see the following content in `yarn.lock`

```yaml
"@types/webpack@*":
  version "4.41.8"
  resolved "https://registry.yarnpkg.com/@types/webpack/-/webpack-4.41.8.tgz#d2244f5f612ee30230a5c8c4ae678bce90d27277"
  integrity sha512-mh4litLHTlDG84TGCFv1pZldndI34vkrW9Mks++Zx4KET7DRMoCXUvLbTISiuF4++fMgNnhV9cc1nCXJQyBYbQ==
  dependencies:
    "@types/anymatch" "*"
    "@types/node" "*"
    "@types/tapable" "*"
    "@types/uglify-js" "*"
    "@types/webpack-sources" "*"
    source-map "^0.6.0"

"@types/webpack@4.41.2":
  version "4.41.2"
  resolved "https://registry.yarnpkg.com/@types/webpack/-/webpack-4.41.2.tgz#c6faf0111de27afdffe1158dac559e447c273516"
  integrity sha512-DNMQOfEvwzWRRyp6Wy9QVCgJ3gkelZsuBE2KUD318dg95s9DKGiT5CszmmV58hq8jk89I9NClre48AEy1MWAJA==
  dependencies:
    "@types/anymatch" "*"
    "@types/node" "*"
    "@types/tapable" "*"
    "@types/uglify-js" "*"
    "@types/webpack-sources" "*"
    source-map "^0.6.0"
```

Note that, actually `@types/webpack@4.41.2` can be merged into `@types/webpack@*`, but yarn didn't merge them. And this can cause nested `node_modules` folders, and duplicate package folders (of different versions) such as

```
\node_modules\@types\webpack-dev-server\node_modules\@types\webpack    (referenced by webpack-dev-server/index.d.ts)
\node_modules\@types\webpack    (referenced by webpack.config.ts)
```

This can cause some unexpected behavior, such as TypeScript namespace augmentation failure, described as below:

* Try to build `webpack.config.ts` with
  
    ```powershell
    yarn build
    ```
    
* You will see the following error

```
yarn run v1.22.4
$ tsc -p .
webpack.config.ts:8:3 - error TS2322: Type '{ mode: "production"; entry: string; devtool: "source-map"; devServer: { contentBase: string; compress: boolean; port: number; watchContentBase: boolean; historyApiFallback: boolean; }; module: { ...; }; resolve: { ...; }; plugins: never[]; optimization: {}; output: {}; }' is not assignable to type 'Configuration'.
  Object literal may only specify known properties, and 'devServer' does not exist in type 'Configuration'.

  8   devServer: {
      ~~~~~~~~~~~~
  9     contentBase: path.join(__dirname, "assets"),
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
... 
 14     historyApiFallback: true
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 15   },
    ~~~


Found 1 error.

error Command failed with exit code 2.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```

* If you delete the nested `webpack` folder (`\node_modules\@types\webpack-dev-server\node_modules\@types\webpack`), the error above disappears.