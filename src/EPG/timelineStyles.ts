// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { PixelRatio } from 'react-native';

const SF = PixelRatio.get();

// Here were have several presets to try custom playheads
export const TIMELINE_STYLES = {
    STYLE_1: {
        progressBar: { hidden: true },
        playhead: {
            source: 'playhead/trianglePlayhead.png',
            verticalOffset: 75 / SF,
        },
    },
    STYLE_2: {
        progressBar: { hidden: true },
        playhead: {
            source: 'playhead/linePlayhead.png',
            verticalOffset: 0,
        },
    },
    STYLE_3: {
        progressBar: { hidden: true },
        playhead: {
            source: 'playhead/complexPlayhead.png',
            verticalOffset: -80 / SF,
        },
    }
}
