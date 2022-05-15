/* This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* exported init */

const { Gio } = imports.gi;

const ResizeWindowByTitleInterface = `
<node>
  <interface name="de.jerolimov.ResizeWindowByTitle">
    <method name="resizeByTitle">
      <arg name="fullTitle" type="s" direction="in" />
      <arg name="posX" type="i" direction="in" />
      <arg name="posY" type="i" direction="in" />
      <arg name="width" type="i" direction="in" />
      <arg name="height" type="i" direction="in" />
      <arg name="found" type="b" direction="out" />
    </method>
    <method name="resizeByPrefix">
      <arg name="prefix" type="s" direction="in" />
      <arg name="posX" type="i" direction="in" />
      <arg name="posY" type="i" direction="in" />
      <arg name="width" type="i" direction="in" />
      <arg name="height" type="i" direction="in" />
      <arg name="found" type="b" direction="out" />
    </method>
    <method name="resizeBySuffix">
      <arg name="suffix" type="s" direction="in" />
      <arg name="posX" type="i" direction="in" />
      <arg name="posY" type="i" direction="in" />
      <arg name="width" type="i" direction="in" />
      <arg name="height" type="i" direction="in" />
      <arg name="found" type="b" direction="out" />
    </method>
    <method name="resizeBySubstring">
      <arg name="substring" type="s" direction="in" />
      <arg name="posX" type="i" direction="in" />
      <arg name="posY" type="i" direction="in" />
      <arg name="width" type="i" direction="in" />
      <arg name="height" type="i" direction="in" />
      <arg name="found" type="b" direction="out" />
    </method>
    <method name="resizeByWmClass">
      <arg name="name" type="s" direction="in" />
      <arg name="posX" type="i" direction="in" />
      <arg name="posY" type="i" direction="in" />
      <arg name="width" type="i" direction="in" />
      <arg name="height" type="i" direction="in" />
      <arg name="found" type="b" direction="out" />
    </method>
    <method name="resizeByWmClassInstance">
      <arg name="instance" type="s" direction="in" />
      <arg name="posX" type="i" direction="in" />
      <arg name="posY" type="i" direction="in" />
      <arg name="width" type="i" direction="in" />
      <arg name="height" type="i" direction="in" />
      <arg name="found" type="b" direction="out" />
    </method>
  </interface>
</node>
`;

class ResizeWindowByTitle {
    #dbus;

    enable() {
        this.#dbus = Gio.DBusExportedObject.wrapJSObject(
            ResizeWindowByTitleInterface,
            this,
        );
        this.#dbus.export(
            Gio.DBus.session,
            '/de/jerolimov/ResizeWindowByTitle',
        );
    }

    disable() {
        this.#dbus.unexport_from_connection(
            Gio.DBus.session,
        );
        this.#dbus = undefined;
    }

    #resizeByPredicate(predicate, posX, posY, width, height) {
        for (const actor of global.get_window_actors()) {
            const window = actor.get_meta_window();
            if (predicate(window)) {
                window.move_resize_frame(false, posX, posY, width, height);
                return true;
            }
        }
        return false;
    }

    #resizeByTitlePredicate(predicate, posX, posY, width, height) {
        return this.#resizeByPredicate(
            (window) => predicate(window.get_title()),
            posX, posY, width, height
        );
    }

    resizeByTitle(fullTitle, posX, posY, width, height) {
        return this.#resizeByTitlePredicate(
            (title) => title === fullTitle,
            posX, posY, width, height
        );
    }

    resizeByPrefix(prefix, posX, posY, width, height) {
        return this.#resizeByTitlePredicate(
            (title) => title.startsWith(prefix),
            posX, posY, width, height
        );
    }

    resizeBySuffix(suffix, posX, posY, width, height) {
        return this.#resizeByTitlePredicate(
            (title) => title.endsWith(suffix),
            posX, posY, width, height
        );
    }

    resizeBySubstring(substring, posX, posY, width, height) {
        return this.#resizeByTitlePredicate(
            (title) => title.includes(substring),
            posX, posY, width, height
        );
    }

    // note: we don’t offer resizeByRegExp,
    // because that would be vulnerable to ReDoS attacks

    resizeByWmClass(name, posX, posY, width, height) {
        return this.#resizeByPredicate(
            (window) => window.get_wm_class() === name,
            posX, posY, width, height
        );
    }

    resizeByWmClassInstance(instance, posX, posY, width, height) {
        return this.#resizeByPredicate(
            (window) => window.get_wm_class_instance() === instance,
            posX, posY, width, height
        );
    }
}

function init() {
    return new ResizeWindowByTitle();
}
