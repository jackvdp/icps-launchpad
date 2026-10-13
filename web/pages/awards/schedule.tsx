import {NextPage} from 'next';
import React from 'react';
import {schedule} from 'data/schedule';
import Schedule from "components/pages/schedule";
import {AWARDS_EVENT_ID} from "data/awards-config";

const Programme: NextPage = () => {
    return (
        <Schedule
            schedule={schedule}
            headTitle={"Schedule – 22nd International Electoral Awards"}
            dates={"Sunday, 29th November – Thursday, 3rd December 2026"}
            intro={"The symposium takes a theme for each day: \"Securing the Ballot: Global Collaboration for Electoral Resilience and Public Trust\" on Tuesday 1 December, and \"Trust, Technology, and Resilience: Unifying Global Election Standards\" on Wednesday 2 December. Session titles and speakers are still being confirmed and will be announced as the programme develops."}
            eventId={AWARDS_EVENT_ID}
        />
    );
};

export default Programme;
