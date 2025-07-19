"use client";

import React, { useState, useCallback, memo } from "react";
import { IconBackspace } from "@tabler/icons-react";

// Memoized individual key to prevent unnecessary re-renders
const KeypadButton = memo(
  ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-2xl cursor-pointer text-2xl font-semibold text-white transition-colors hover:bg-white/20 active:bg-white/30"
    >
      {children}
    </button>
  ),
);
KeypadButton.displayName = "KeypadButton";

const NumberKeypad = memo(
  ({
    onNumberPress,
    onDelete,
  }: {
    onNumberPress: (num: string) => void;
    onDelete: () => void;
  }) => {
    // Pre-define keypad numbers for efficiency
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0];

    return (
      <div className="mt-auto grid h-64 grid-cols-3 gap-1">
        {numbers.map((num, index) => (
          <KeypadButton
            key={index}
            onClick={() => onNumberPress(num.toString())}
          >
            {num}
          </KeypadButton>
        ))}
        <KeypadButton onClick={onDelete}>
          <IconBackspace size={24} />
        </KeypadButton>
      </div>
    );
  },
);
NumberKeypad.displayName = "NumberKeypad";

export default NumberKeypad;
