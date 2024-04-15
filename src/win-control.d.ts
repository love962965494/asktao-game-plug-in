declare module 'win-control' {
  const Window: WinControl
  const WindowStates: typeof WindowStatesTypeEnum
  const HWND: typeof HWNDTypeEnum
  const SWP: typeof SWPTypeEnum

  export interface WinControl {
    getByPid(pid: number): WinControlInstance
    // Get current foreground window.
    getForeground(): WinControlInstance
  }

  export interface WinControlInstance {
    setShowStatus(status: WindowStatesTypeEnum): boolean
    /**
     * @param hwnd {number} A HWND to precede the positioned window in the Z order or a value of HWND
     * @param x {number}: new position of the left side of the window.
     * @param y {number}: new position of the top of the window.
     * @param cx {number}: new width in pixels.
     * @param cy {number}: new height in pixels.
     * @param uFlags: the window sizing and positioning flags. See SWP
     */
    setPosition(hwnd: HWNDTypeEnum, x?: number, y?: number, cx?: number, cy?: number, uFlags?: SWPTypeEnum): boolean
    getDimensions(): { left: number; right: number; top: number; bottom: number }
    close(): void
    // Brings the current window into the foreground and activates the window.
    setForeground(): void
    // Returns a string with the window's title bar (if it has one).
    getTitle(): string
  }

  export enum WindowStatesTypeEnum {
    /**
     *  hides the window and activates another window
     */
    HIDE = 0,
    /**
     *  activates and displays a window
     */
    SHOWNORMAL = 1,
    /**
     *  activates the window and displays it as a minimized window
     */
    SHOWMINIMIZED = 2,
    /**
     *  maximizes the specified window
     */
    MAXIMIZE = 3,
    /**
     *  activates the window and displays it as a maximized window
     */
    SHOWMAXIMIZED = 4,
    /**
     *  displays a window in its most recent size and position
     */
    SHOWNOACTIVATE = 5,
    /**
     *  activates the window and displays it in its current size and position
     */
    SHOW = 6,
    /**
     *  minimizes the specified window and activates the next top-level window in the Z order
     */
    MINIMIZE = 7,
    /**
     *  displays the window as a minimized window
     */
    SHOWMINNOACTIVE = 8,
    /**
     *  displays the window in its current size and positio
     */
    SHOWNA = 9,
    /**
     *  activates and displays the window. If the window is minimized or maximized, the system restores it to its original size and position
     */
    RESTORE = 10,
    /**
     *  sets the show state based on the SW_ value specified in the STARTUPINFO structure passed to the CreateProcess function by the program that started the application
     */
    SHOWDEFAULT = 11,
    /**
     *  minimizes a window, even if the thread that owns the window is not responding
     */
    FORCEMINIMIZE = 12,
  }

  export enum HWNDTypeEnum {
    /**
     *  places the window at the bottom of the Z order
     */
    BOTTOM = 1,
    /**
     *  places the window above all non-topmost windows (that is, behind all topmost windows)
     */
    NOTOPMOST = -2,
    /**
     *  places the window at the top of the Z order
     */
    TOP = 0,
    /**
     *  places the window above all non-topmost windows. The window maintains its topmost position even when it is deactivated
     */
    TOPMOST = -1,
  }

  export enum SWPTypeEnum {
    /**
     *  retains the current size (ignores the cx and cy parameters)
     */
    NOSIZE = 0x0001,
    /**
     *  retains the current position (ignores X and Y parameters)
     */
    NOMOVE = 0x0002,
    /**
     *  retains the current Z order
     */
    NOZORDER = 0x0004,
    /**
     *  does not redraw changes. If this flag is set, no repainting of any kind occurs
     */
    NOREDRAW = 0x0008,
    /**
     *  does not activate the window
     */
    NOACTIVATE = 0x0010,
    /**
     *  draws a frame around the window
     */
    DRAWFRAME = 0x0020,
    /**
     *  applies new frame styles set
     */
    FRAMECHANGED = 0x0020,
    /**
     *  displays the window
     */
    SHOWWINDOW = 0x0040,
    /**
     *  hides the window
     */
    HIDEWINDOW = 0x0080,
    /**
     *  discards the entire contents of the client area
     */
    NOCOPYBITS = 0x0100,
    /**
     *  does not change the owner window's position in the Z order
     */
    NOOWNERZORDER = 0x0200,
    /**
     *  same as the NOOWNERZORDER flag
     */
    NOREPOSITION = 0x0200,
    /**
     *  prevents the window from receiving the WM_WINDOWPOSCHANGING message
     */
    NOSENDCHANGING = 0x0400,
    /**
     *  prevents generation of the WM_SYNCPAINT message
     */
    DEFERERASE = 0x2000,
    /**
     * if the calling thread and the thread that owns the window are attached to different input queues, the system posts the request to the thread that owns the window
     */
    ASYNCWINDOWPOS = 0x4000,
  }
}