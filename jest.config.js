// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { createDefaultPreset } = require('ts-jest');

const defaultPreset = createDefaultPreset();

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...defaultPreset,
  testMatch: [
    "**/__tests__/**.test.ts"
  ],
  coverageReporters: [
    "cobertura",
    "html",
    "text"
  ]
}
