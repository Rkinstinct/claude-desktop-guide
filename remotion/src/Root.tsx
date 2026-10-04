import React from 'react';
import {Composition} from 'remotion';
import {ChapterCard} from './ChapterCard';
import {ShareClip} from './ShareClip';
import {Celebration} from './Celebration';
import {ConceptCtx} from './ConceptCtx';
import {ConceptPerms} from './ConceptPerms';
import {ConceptMcp} from './ConceptMcp';
import {ConceptHooks} from './ConceptHooks';
import {ConceptSubagents} from './ConceptSubagents';
import {ConceptParallel} from './ConceptParallel';
import {Recap} from './Recap';
import {GuideComplete} from './GuideComplete';
import {PreviewLoop} from './PreviewLoop';
import {GuideOpening} from './GuideOpening';
export const Root: React.FC = () => (
  <>
    <Composition
      id="ChapterCard"
      component={ChapterCard}
      durationInFrames={110}
      fps={30}
      width={1080}
      height={608}
      defaultProps={{num: '01', title: 'מה יש לכם ואיך המדריך עובד', part: 'חלק א׳ · Claude Chat', seed: 7}}
    />
    <Composition id="ShareClip" component={ShareClip} durationInFrames={450} fps={30} width={1080} height={1920} />
    <Composition id="Celebration" component={Celebration} durationInFrames={90} fps={30} width={1080} height={608} />
    <Composition id="ConceptHooks" component={ConceptHooks} durationInFrames={660} fps={30} width={1080} height={608} />
    <Composition id="ConceptSubagents" component={ConceptSubagents} durationInFrames={660} fps={30} width={1080} height={608} />
    <Composition
      id="ConceptParallel"
      component={ConceptParallel}
      durationInFrames={660}
      fps={30}
      width={1080}
      height={608}
    />
      <Composition
      id="Recap"
      component={Recap}
      durationInFrames={420}
      fps={30}
      width={1080}
      height={608}
      defaultProps={{num: '08', lines: ['כל שיחה היא סשן', 'עבודה מקבילה', 'פיצול מסך']}}
    />
      <Composition id="GuideComplete" component={GuideComplete} durationInFrames={120} fps={30} width={1080} height={608} />
    <Composition id="PreviewLoop" component={PreviewLoop} durationInFrames={480} fps={30} width={1080} height={608} />
      <Composition id="ConceptCtx" component={ConceptCtx} durationInFrames={660} fps={30} width={1080} height={608} />
    <Composition id="ConceptPerms" component={ConceptPerms} durationInFrames={660} fps={30} width={1080} height={608} />
    <Composition id="ConceptMcp" component={ConceptMcp} durationInFrames={660} fps={30} width={1080} height={608} />
    <Composition id="GuideOpeningDesktop" component={GuideOpening} durationInFrames={300} fps={30} width={1280} height={720} />
  </>
);
