import { useRef, useCallback, useEffect } from 'react';

export const useScrolling = (isModalOpen, isStreaming) => {
    const messagesEndRef = useRef(null);
    const scrollAreaRef = useRef(null);
    const scrollingEnabled = useRef(true);
    const scrollTimeoutRef = useRef(null);
    const lastScrollTime = useRef(0);
    const isClosingModal = useRef(false);

    const positionAtBottomInstant = useCallback(() => {
        if (!scrollingEnabled.current || isModalOpen || isClosingModal.current) {
            return;
        }

        if (scrollAreaRef.current) {
            const scrollHeight = scrollAreaRef.current.scrollHeight;
            scrollAreaRef.current.scrollTop = scrollHeight;
        }
    }, [isModalOpen]);

    const scrollToBottomSmooth = useCallback(() => {
        if (!scrollingEnabled.current || isModalOpen || isClosingModal.current) {
            return;
        }

        const now = Date.now();
        const timeSinceLastScroll = now - lastScrollTime.current;

        if (timeSinceLastScroll < 100) {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                scrollToBottomSmooth();
            }, 100);
            return;
        }

        lastScrollTime.current = now;

        requestAnimationFrame(() => {
            if (scrollingEnabled.current && !isModalOpen && !isClosingModal.current) {
                messagesEndRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }
        });
    }, [isModalOpen]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    return {
        messagesEndRef,
        scrollAreaRef,
        scrollingEnabled,
        isClosingModal,
        positionAtBottomInstant,
        scrollToBottomSmooth
    };
};