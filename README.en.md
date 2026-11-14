[中文](README.md) | [English](README.en.md)

# Nonstandard Notebook · Companion Animations

I am Hu Xiaoqun (胡小群), the Chinese translator of *Nonstandard Notebook*. The Chinese edition credits the translation to the “胡小群讲数学团队” (Hu Xiaoqun Mathematics Team). I created this project as a set of companion animations for the patterns in the book.

The original book, **Nonstandard Notebook: Mathematically Ruled Pages for Unruly Thoughts**, is by **Tim Chartier** and **Amy Langville**. [About the original edition](https://press.uchicago.edu/ucp/books/book/chicago/N/bo230146731.html)

## Why I made these animations

While translating and reading the book, I often felt that many of its patterns would be easier to understand if we could watch them take shape.

How can a simple set of straight lines form a complex pattern? What happens when a parameter changes? How are those unusual curves drawn, step by step?

The printed patterns show the results. These animations aim to show the process as well. You can read alongside the book, play or pause an animation, and move through its progress while comparing the drawing with its equations and parameters.

## What you can explore

The project currently includes **12 chapters and 174 pattern pages**, with:

- Navigation by chapter, pattern, and printed page number.
- Static patterns alongside animated drawing processes.
- Playback, pause, restart, and speed controls.
- A progress slider for exploring different stages of a drawing.
- Equations and parameters to help explain how each pattern is constructed.

It works in desktop and mobile browsers. The website interface is currently in Chinese.

**[Explore the animations](https://hxqjsx.github.io/math-notebook/)**

The animations are intended to accompany the book. Teachers are also welcome to use them for classroom demonstrations, or to explore and discuss the patterns with children.

## About the open-source project

The source code has been public since **v24**. I hope this project will help more people understand and enjoy the mathematics in the book. Questions, interaction improvements, and code contributions are welcome.

This repository contains the current source code and the files needed to build it. It does not include a PDF of the book.

## Build locally

You need Python 3.10 or later. Automated checks also require Node.js 20 or later.

Download or clone this repository, then run from the project directory:

```sh
python3 scripts/build.py
```

Once the build finishes, open `dist/index.html` in your browser.

To run the automated checks:

```sh
python3 scripts/check.py --skip-build
```

## Feedback and improvements

If you find a problem with a pattern, equation, animation, or mobile layout, please report it in [Issues](https://github.com/hxqjsx/math-notebook/issues).

Please include the printed page number or pattern name, your device and browser, and a description of the problem. Screenshots are helpful.

The project will continue to receive corrections and improvements.

## Credits and licensing

- **Original book:** Tim Chartier and Amy Langville
- **Chinese translation:** 胡小群讲数学团队 (Hu Xiaoqun Mathematics Team)
- **Companion animations:** Hu Xiaoqun (胡小群)

The project's own program code is available under the [MIT License](LICENSE), which permits use, modification, and distribution subject to retaining the copyright and license notices.

The book's text, patterns, cover images, and marks, as well as third-party libraries, fonts, and other materials, retain their respective rights and are not relicensed by this project's open-source code license. See [Third-party notices](THIRD_PARTY_NOTICES.md) for details.
