---
layout: post
title: "I went through the pain of setting up eslint on Sublime Text so you don't have to"
comments: true
description: "How to do it"
---

## Preparation:

Make sure your npm environment is clean, a.k.a if you tried to do many things before finding this, make sure to remove everything because I can assure you of this: you will have dependency errors.
Also, make sure you're running an updated version of NodeJS.

## The thing itself:

1. Add `eslint` as a local dependency.

```
npm install eslint
```

This will fetch the latest version of `eslint` and add it to your `package.json` file.

2. Install the sublime extension with npm

```
npm install stylelint_d
```

3. Within Sublime Text, bring up the Command Palette and type install. Among the commands you should see Package Control: Install Package. If that command is not highlighted, use the keyboard or mouse to select it. There will be a pause of a few seconds while Package Control fetches the list of available plugins.

When the plugin list appears, type stylelint_d. Among the entries you should see SublimeLinter-contrib-stylelint_d. If that entry is not highlighted, use the keyboard or mouse to select it.

4. Run:

```
eslint --init
```

and configure it as you like.

You should be able to run this automatically. Personally, I have to bring it up the Sublime-eslint console thing with (ctrl+alt+E) on my linux.

## Common pitfalls:

1. SublimeLinter will detect some installed local plugins, and thus it should work automatically for e.g. .vue or .ts files. If it works on the command line, there is a chance it works in Sublime without further ado.

Make sure the plugins are installed locally colocated to eslint itself. T.i., technically, both eslint and its plugins are described in the very same package.json.

2. Linter configuration:

In order for stylelint_d to be executed by SublimeLinter, you must ensure that its path is available to SublimeLinter. Before going any further, please read and follow the steps in [“Finding a linter executable”](http://sublimelinter.readthedocs.org/en/latest/troubleshooting.html#finding-a-linter-executable) through “Validating your PATH” in the documentation.

Once you have installed and configured stylelint_d, you can proceed to install the SublimeLinter-contrib-stylelint_d plugin if it is not yet installed.

## Further resources:

Part of this text was cced from the following repos:

[https://github.com/SublimeLinter/SublimeLinter-eslint](https://github.com/SublimeLinter/SublimeLinter-eslint)

[https://github.com/jo-sm/SublimeLinter-contrib-stylelint_d](https://github.com/jo-sm/SublimeLinter-contrib-stylelint_d)

[https://github.com/eslint/eslint#configuration](https://github.com/eslint/eslint#configuration)

They might be useful to you if you fell into a non described pitfall.
