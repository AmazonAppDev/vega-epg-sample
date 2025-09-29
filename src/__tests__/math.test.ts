// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { isEven } from "../math";

test('when 2 then isEven true', () => {
    const result = isEven(2);
    expect(result).toEqual(true);
});
