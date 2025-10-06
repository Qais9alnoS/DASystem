import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 px-0 relative">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <Monitor className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
                <DropdownMenuItem 
                    onClick={() => setTheme('light')}
                    className={`flex items-center ${theme === 'light' ? 'bg-accent' : ''}`}
                >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>فاتح</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => setTheme('dark')}
                    className={`flex items-center ${theme === 'dark' ? 'bg-accent' : ''}`}
                >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>داكن</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => setTheme('system')}
                    className={`flex items-center ${theme === 'system' ? 'bg-accent' : ''}`}
                >
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>النظام</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}