# Joystick / Gamepad example
# STOP_FIRE from https://wiki.libsdl.org/SDL_JoyAxisEvent
from sdl2 import *
import sdl2.ext, subprocess
from kivy.app import App
from kivy.clock import Clock
from kivy.uix.widget import Widget
from kivy.core.window import Window
from kivy.properties import ObjectProperty, ListProperty

class Listener(Widget):
    # fire / trigger axis
    FIRE = (2, 5)
    STOP_FIRE = -32767

    # min value for user to actually trigger axis
    OFFSET = 8000

    # current values + event instance
    VALUES = ListProperty([])
    HOLD = ObjectProperty(None)

    def __init__(self, **kwargs):
        super(Listener, self).__init__(**kwargs)

        # get joystick events first
        Window.bind(on_joy_hat=self.on_joy_hat)
        Window.bind(on_joy_ball=self.on_joy_ball)
        Window.bind(on_joy_axis=self.on_joy_axis)
        Window.bind(on_joy_button_up=self.on_joy_button_up)
        Window.bind(on_joy_button_down=self.on_joy_button_down)
        # SDL_Init(SDL_INIT_GAMECONTROLLER)
        # SDL_Init(SDL_INIT_HAPTIC)
        # SDL_GameControllerAddMappingsFromFile(b"resources/gamecontrollerdb.txt")
        # controller = SDL_GameControllerOpen(0)
        # joy = SDL_GameControllerGetJoystick(controller)
        # haptics = SDL_HapticOpenFromJoystick(joy)
        # SDL_HapticRumbleInit(haptics)
        # print(SDL_NumJoysticks())
        # print(SDL_IsGameController(0))
        # print(SDL_HapticRumbleSupported(haptics))

    # show values in console
    def print_values(self, *args):
        print(self.VALUES)

    def joy_motion(self, event, id, axis, value):
        # HAT first, returns max values
        if isinstance(value, tuple):
            if not value[0] and not value[1]:
                Clock.unschedule(self.HOLD)
            else:
                self.VALUES = [event, id, axis, value]
                self.HOLD = Clock.schedule_interval(self.print_values, 0)
            return

        # unschedule if at zero or at minimum (FIRE)
        if axis in self.FIRE and value < self.STOP_FIRE:
            Clock.unschedule(self.HOLD)
            return
        elif abs(value) < self.OFFSET or self.HOLD:
            Clock.unschedule(self.HOLD)

        # schedule if over OFFSET (to prevent accidental event with low value)
        if (axis in self.FIRE and value > self.STOP_FIRE or
                axis not in self.FIRE and abs(value) >= self.OFFSET):
            self.VALUES = [event, id, axis, value]
            self.HOLD = Clock.schedule_interval(self.print_values, 0)

    # replace window instance with identifier
    def on_joy_axis(self, win, stickid, axisid, value):
        self.joy_motion('axis', stickid, axisid, value)

    def on_joy_ball(self, win, stickid, ballid, value):
        self.joy_motion('ball', ballid, axisid, value)

    def on_joy_hat(self, win, stickid, hatid, value):
        self.joy_motion('hat', stickid, hatid, value)

    def on_joy_button_down(self, win, stickid, buttonid):
        print('button_down', stickid, buttonid)
        if buttonid == 7:
            print('Rumbling.')
            sdl2.SDL_HapticRumblePlay(haptics, float(0.5), 2000)

    def on_joy_button_up(self, win, stickid, buttonid):
        print('button_up', stickid, buttonid)


class JoystickApp(App):
    def build(self):
        return Listener()


if __name__ == '__main__':
    # subprocess.call("xboxdrv --silent --force-feedback --detach-kernel-driver --deadzone 8000", shell=True)
    JoystickApp().run()