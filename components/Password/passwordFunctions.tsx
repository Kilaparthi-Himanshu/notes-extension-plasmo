import React from 'react';

export default function passwordChecker(password1: string, password2: string) {
    if (password1 === password2) {
        return true;
    } else {
        return false;
    }
}