#include <iostream>
#include <napi.h>
#include <thread>
#include <atomic>
#include <Windows.h>

std::atomic<bool> isRunning{true};

HHOOK hook = NULL;
std::thread hookThread;

LRESULT CALLBACK LowLevelKeyboardProc(int nCode, WPARAM wParam, LPARAM lParam)
{
    if (nCode < 0)
        return CallNextHookEx(NULL, nCode, wParam, lParam);

    KBDLLHOOKSTRUCT *s = reinterpret_cast<KBDLLHOOKSTRUCT *>(lParam);

    std::cout << "Pressed: ";
    std::cout << s->vkCode;
    std::cout << std::endl;

    if (s->vkCode == VK_LWIN)
        return 1;

    if (s->flags == LLKHF_ALTDOWN)
    {
        std::cout << "ALT DOWN\n";
        return 1;
    }

    return CallNextHookEx(NULL, nCode, wParam, lParam);
}

void setupMessagePump()
{
    MSG msg;
    while (isRunning.load())
    {
        auto found = PeekMessage(&msg, NULL, 0, 0, PM_REMOVE);
        if (found)
        {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
    }
    std::cout << "End thread" << std::endl;
    UnhookWindowsHookEx(hook);
}

void setupHookAndPump()
{
    if (hook != NULL)
        return;

    std::cout << "Setup Windows hook" << std::endl;
    hook = SetWindowsHookEx(WH_KEYBOARD_LL, LowLevelKeyboardProc, GetModuleHandle(NULL), 0);

    if (hook == NULL)
    {
        std::cout << "Setup Windows hook failed" << std::endl;
    }

    std::cout << "Setup message pump" << std::endl;
    setupMessagePump();
}

void setupHook(const Napi::CallbackInfo &info)
{
    std::cout << "Setup hook" << std::endl;
    hookThread = std::thread{};
}

void removeHook(const Napi::CallbackInfo &info)
{
    std::cout << "Remove hook" << std::endl;
    isRunning.store(false);
}

Napi::Object initAll(Napi::Env env, Napi::Object exports)
{
    exports.Set("lockKeyboard", Napi::Function::New(env, setupHook));
    exports.Set("unlockKeyboard", Napi::Function::New(env, removeHook));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, initAll);
