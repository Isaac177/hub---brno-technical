import {
    Caption,
    Controls,
    ControlsGroup,
    TimeSlider,
    PlayButton,
    MuteButton,
    FullscreenButton,
    SettingsButton,
    Volume,
    Time,
    ChapterTitle,
  } from '@vidstack/react';
  
  export function VideoLayout({ thumbnails }) {
    return (
      <>
        <Caption />
  
        <Controls.Root className="media-controls:absolute media-controls:bottom-0 media-controls:left-0 media-controls:right-0 media-controls:bg-gradient-to-t media-controls:from-black/80 media-controls:to-transparent media-controls:p-2">
          <ControlsGroup className="flex items-center justify-center w-full gap-2">
            <TimeSlider.Root className="relative w-full group" thumbnails={thumbnails}>
              <TimeSlider.Track className="h-1 bg-white/30 rounded-sm" />
              <TimeSlider.TrackFill className="h-1 bg-primary rounded-sm" />
              <TimeSlider.Thumb className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <TimeSlider.Preview className="hidden group-hover:flex absolute bottom-full p-1 bg-black/80 rounded" />
            </TimeSlider.Root>
          </ControlsGroup>
  
          <ControlsGroup className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <PlayButton className="w-10 h-10" />
              <MuteButton className="w-10 h-10" />
              <Volume className="w-20" />
              <Time className="text-sm" />
              <ChapterTitle className="text-sm" />
            </div>
  
            <div className="flex items-center gap-2">
              <SettingsButton className="w-10 h-10" />
              <FullscreenButton className="w-10 h-10" />
            </div>
          </ControlsGroup>
        </Controls.Root>
      </>
    );
  }