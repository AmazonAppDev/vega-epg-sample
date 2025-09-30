// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { roundToNearestMinutes } from 'date-fns';

import { EPG, EPGActions, Typography } from '@amazon-devices/kepler-ui-components';
import { useReportFullyDrawn } from '@amazon-devices/kepler-performance-api';


import { GROUP_2_DATA, GROUP_1_DATA } from './EPG/data';
import { TIMELINE_STYLES } from './EPG/timelineStyles';

interface HeaderState {
  title: string;
  image: string | undefined;
  shortDescription: string | undefined;
}

/*
* favStates mimics an external data source that stores the favorite channels from the data.
* EPG internally tracks which channels are favorited so it can render the appropriate favorite icon.
* This data is localized to the EPG. A common use case is to track the favorite status of channels in the customer data.
* The customer data needs to be manually updated when updateFavorite is called to keep the data in sync.
*/

const favStates = new Map<string, boolean>();

const THIRTY_MINUTES = 180000;
interface HeaderData {
  title: string;
  image: string;
  shortDescription?: string;
}


/*
* EPG tracks the current time with a playhead on the timeline.
* If we stay on the EPG long enough, that playhead indicator will eventually move off-screen.
* If we want to keep the currently airing programs always in view, we can the updateGridStartTime()
* function to adjust the start time of the grid. The following function finds the nearest half-hour
* to the current time and calls updateGridStartTime().
*/

function updateTime(epg: React.RefObject<EPGActions>) {
  if (epg.current?.updateGridStartTime) {
    const currentTimeBoundary = roundToNearestMinutes(new Date(), {
      nearestTo: 30,
      roundingMethod: 'floor',
    });
    console.log(
      'Updating grid start time to ' + currentTimeBoundary.toTimeString(),
    );
    epg.current.updateGridStartTime(currentTimeBoundary.getTime());
  }
};

// Sets the interval of updateTime to be every 30 minutes
function setRegularUpdateTimeInterval(epg: React.RefObject<EPGActions>) {
  return setInterval(() => {
    updateTime(epg);
  }, THIRTY_MINUTES);
};

export const App = () => {
  const epg = useRef<EPGActions>(null); // This ref is used to access imperative functions of EPG
  const reportFullyDrawnCallback = useReportFullyDrawn(); // Used for performance metrics

  // This app has a header component that displays information about the currently focused program. Information in the header is stored in the following state variable.
  const [header, updateHeader] = useState<HeaderData>({
    title: '',
    image: '',
    shortDescription: '',
  });

  React.useEffect(() => {
    // The updateData function is required to add data to the EPG. Because it is an imperative function we need to wait for the ref to be set.
    if (epg.current?.updateData) {
      console.log('Calling updateData');
      epg.current.updateData(GROUP_1_DATA);
      epg.current.updateData(GROUP_2_DATA);
    }


    /*
    * As mentioned above, this App updates the start time on the EPG every 30 minutes to shift
    * the view to the currently airing programs. Specifically, the start time is updated to he nearest half hour.
    * This code triggers the first update cycle by calculating the nearest half hour of the current time.
    * Afterwards, updateTime is called every 30 minutes.
    */
    const nextTimeBoundary = roundToNearestMinutes(new Date(), {
      nearestTo: 30,
      roundingMethod: 'ceil',
    });
    const timeDifferential = nextTimeBoundary.getTime() - new Date().getTime();
    let mainInterval: any;
    const firstInterval = setTimeout(() => {
      updateTime(epg);
      mainInterval = setRegularUpdateTimeInterval(epg);
      console.log('Set main 30 min timer');
    }, timeDifferential);
    console.log(
      `Set timer for ${timeDifferential} ms from now targeting update at ${nextTimeBoundary}`,
    );
    return () => {
      clearInterval(mainInterval);
      clearInterval(firstInterval);
    };
  }, []);
  return (
    <View style={styles.background}>
      <View style={styles.header}>
        <Image style={styles.headerImage} source={{ uri: header.image }} />
        <View style={styles.miniDetails}>
          <Typography
            variant="title"
            size="lg"
            style={styles.headerTitle}
            numberOfLines={1}>
            {header.title}
          </Typography>
          <Typography
            variant="body"
            style={styles.headerDescription}
            numberOfLines={2}>
            {header.shortDescription}
          </Typography>
        </View>
      </View>
      <EPG
        ref={epg}
        onTileFocus={({ payload }) => {
          console.log(`Focused on ${JSON.stringify(payload)}`);
          const isInitialFocusEvent = Object.keys(payload.program).length === 0;
          if (!isInitialFocusEvent) {
            // On Program tile focus, the header is updated with the respective program information.
            updateHeader({
              title: payload.program.title,
              image: payload.program.extras.backgroundUrl,
              shortDescription: payload.program.shortDescription,
            });
          } else {
            // The initial focus is used to signal for performance metrics to signal that the EPG is fully drawn.
            reportFullyDrawnCallback();
          }
        }}
        onScroll={(event) => {
          console.log(
            `Scrolled to  row ${event.row} at time ${new Date(event.timeMs)}`,
          );
        }}
        onMenu={({ payload }) => {
          /*
          * EPG has a feature to favorite/unfavorite channels.
          * In this App, the menu button is used to trigger favoriting/unfavoriting the Channel in the EPG.
          * Additionally, the favorite status of the channel is updated in the `favStates` data structure.
          * This keeps the data source for the EPG in sync with the data inside the EPG.
          */
          const id = payload.channel.id;
          console.log(`Menu button pressed on ${payload.channel.displayName}`);
          if (!favStates.has(id)) {
            if (payload.channel.isFavorite) {
              favStates.set(id, payload.channel.isFavorite);
            } else {
              favStates.set(id, false); // default state is false
            }
          }
          let newState = !favStates.get(id);
          epg.current?.updateFavorite(id, newState);
          console.log(
            `Called updateFavorite with id ${id} and value ${newState}`,
          );
          favStates.set(id, newState);
        }}
        onTilePress={({ payload }) => {
          console.log(`Pressed on ${JSON.stringify(payload)}`);
        }}
        tileLayout="standard" // note: "expanded" will increase row height
        focusBorder={{
          enabled: true,
        }}
        tileStyle={{
          borderRadius: 6,
          rowHeight: 88, // adjust this when switching tileLayout (or remove it to get the default)
          fontSize: 28,
          pendingBackgroundColor: '#3A4558',
          elapsedBackgroundColor: '#4C5566',
          backgroundColor: '#14171B',
          foregroundColor: '#E4E4E7',
          focusedForegroundColor: '#E4E4E7',
          fontFamilyPrimary: 'Roboto-Regular',
          fontFamilySecondary: 'Roboto-Medium',
        }}
        overlayStyle={{
          enabled: true,
          pendingColor: '#686868',
          elapsedColor: '#E94047',
        }}
        logoStyle={{
          width: 320,
          backgroundColor: '#d0d0d0',
        }}
        timelineStyle={TIMELINE_STYLES.STYLE_1}
        favoriteStyle={{
          imageOn: 'heart.png',
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  background: { backgroundColor: '#373940' },
  epgActionButtons: {
    flexDirection: 'row',
    margin: 20,
    width: '40%',
    justifyContent: 'space-evenly',
  },
  header: {
    width: '100%',
    height: 400,
    backgroundColor: '#202124',
    marginBottom: 20,
    flexDirection: 'row',
  },
  headerTitle: {
    zIndex: 1,
    fontFamily: 'Roboto Regular',
    color: '#DADADA',
    margin: 10,
    marginTop: 60,
  },
  headerDescription: {
    zIndex: 1,
    fontFamily: 'Roboto-Thin',
    color: '#DADADA',
    width: 900,
    margin: 10,
  },
  headerImage: {
    height: 400,
    width: 711,
    opacity: 0.7,
  },
  miniDetails: {
    paddingLeft: 20,
    flexDirection: 'column',
  },
});
