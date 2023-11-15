# Gnome extension to resize windows via DBUS / cli

Origin extension was developed by [Lucas Werkmeister](https://github.com/lucaswerkmeister) to [activate a window by title](https://github.com/lucaswerkmeister/activate-window-by-title) from the commandline (via D-Bus).

---

This GNOME Shell extension allow you to to resize (focus, bring to the foreground) a window
based on its title (or `WM_CLASS`, see below).
It exposes a D-Bus interface with multiple functions and has no user interface of its own
but can be called from the command line or other programs.

The `main` branch works / should work with Gnome 45+

For Gnome 42-44 checkout the branch `gnome-44`.

## D-Bus usage

The extension extends the `org.gnome.Shell` service on the session bus
with a `/de/jerolimov/ResizeWindow` object,
which implements the `de.jerolimov.ResizeWindow` interface containing the following methods:

- **resizeActive**, to resize the active (focused) window
- **resizeByTitle**, to resize the window with the given full, exact title
- **resizeByPrefix**, to resize the window whose title starts with the given prefix
- **resizeBySuffix**, to resize the window whose title ends with the given suffix
- **resizeBySubstring**, to resize the window whose title contains the given string
- **resizeByWmClass**, to resize the window with the given full, exact name part of its `WM_CLASS`
- **resizeByWmClassInstance**, to resize the window with the given full, exact instance part of its `WM_CLASS`

Each method takes four to five argument, for the filter, posX, posY, width and height
and returns a single boolean indicating whether such a window was found or not.
Strings are matched case-sensitively.

The `WM_CLASS` is originally an X concept, but is available under Wayland as well
(exposed via `get_wm_class()` and `get_wm_class_instance()` on a `Meta.Window`).
It’s a pair of strings (name, instance) forming a kind of “application name”,
and both are more “stable” than the title (which may include changing details);
I believe the name is supposed to be more general than the instance,
but looking at some windows on my system I can’t really tell a difference,
both components seem mostly the same apart from arbitrary capitalization or punctuation differences.
Still, the `WM_CLASS` may be useful for activating a certain application regardless of its current window title
(e.g. GNOME Terminal does not include an application name in the window title).
You can see current name and instance strings in Looking Glass (<kbd>Alt</kbd>+<kbd>F2</kbd> `lg`):
```js
global.get_window_actors().map(a => a.get_meta_window()).map(w => `${w.get_wm_class()} (${w.get_wm_class_instance()})`)
```

## Command line usage

You can call these methods using your favorite D-Bus command line tool, for example:

```sh
gdbus call --session \
    --dest org.gnome.Shell \
    --object-path /de/jerolimov/ResizeWindow \
    --method de.jerolimov.ResizeWindow.resizeBySubstring \
    'Firefox' \
    100 \
    100 \
    1920 \
    1080
```

```sh
sleep 2; \
gdbus call --session \
    --dest org.gnome.Shell \
    --object-path /de/jerolimov/ResizeWindow \
    --method de.jerolimov.ResizeWindow.resizeActive \
    100 \
    100 \
    1920 \
    1080
```

## License

GNU GPL v2 or later.
