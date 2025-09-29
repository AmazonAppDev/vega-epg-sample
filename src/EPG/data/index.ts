// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {addDays, addMinutes, isBefore, roundToNearestMinutes} from 'date-fns';
import {Channel, Program} from '@amzn/keplerscript-epg';
import {} from './channelLogos';
import headerImages from '../images.json';

// Helper function to randomly select an image URL
const getRandomImageUrl = (): string => {
  const randomIndex = Math.floor(Math.random() * headerImages.images.length);
  return headerImages.images[randomIndex];
};

export const START_TIME = roundToNearestMinutes(new Date(), {
  nearestTo: 30,
  roundingMethod: 'floor',
});

export const END_TIME = addDays(START_TIME, 2);

const GROUPS = [
  {
    name: 'Group 1',
    id: 'group1',
    channelsCount: 16,
  },
  {
    name: 'Group 2',
    id: 'group2',
    channelsCount: 5,
  },
];

const randomProgramDurationMins = () => {
  const maxProgramDuration = 120;
  const durationStep = 15;
  return (
    (Math.floor((Math.random() * maxProgramDuration) / durationStep) + 1) *
    durationStep
  );
};

const createGroupData = (group: {
  name: string;
  id: string;
  channelsCount: number;
}) => {
  const channelData: Channel[] = [];
  for (
    let channelIndex = 1;
    channelIndex <= group.channelsCount;
    channelIndex++
  ) {
    const channelString = `CH ${channelIndex}`;
    const programs: Program[] = [];
    let programStartTime = START_TIME;
    let programIndex = 0;

    while (isBefore(programStartTime, END_TIME)) {
      let programEndTime = addMinutes(programStartTime, randomProgramDurationMins());
      programs.push({
        title: `Program ${programIndex} [CH ${channelIndex}]`,
        startTime: programStartTime.getTime(),
        endTime: programEndTime.getTime(),
        programId: `program-${programIndex}`,
        shortDescription: `Short description for program ${programIndex}`,
        extras: {
          backgroundUrl: getRandomImageUrl(),
        },
      });
      programStartTime = programEndTime;
      programIndex++;
    }
    channelData.push({
      id: channelString,
      displayName: channelString,
      groupId: group.id,
      groupName: group.name,
      logoUrl: `file:///pkg/bundle/assets/assets/image/channelLogos/${group.id}/channel${channelIndex}.png`,
      programs,
    });
  }
  return channelData;
  
};


export const GROUP_1_DATA: Channel[] = createGroupData(GROUPS[0]);
export const GROUP_2_DATA: Channel[] = createGroupData(GROUPS[1]);
