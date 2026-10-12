import {NextPage} from 'next';
import {Fragment} from 'react';
// -------- custom component -------- //
import {Navbar} from 'components/blocks/navbar';
import {Footer} from 'components/blocks/footer';
import SimpleBanner from 'components/blocks/banner/SimpleBanner';
import Judges from 'components/blocks/judges/Judges';
import PageProgress from 'components/common/PageProgress';
import CustomHead from "components/common/CustomHead";

const JudgesPage: NextPage = () => {
    return (
        <Fragment>
            <CustomHead
                title="Judges – 22nd International Electoral Awards"
                description="The Awarding Committee for the 22nd International Electoral Awards: the panel of international electoral experts who judge the nominations."
            />
            <PageProgress/>

            <Navbar/>

            <SimpleBanner title={"Judges"}/>

            <main className="content-wrapper">

                <Judges/>

            </main>

            <Footer/>
        </Fragment>
    );
};

export default JudgesPage;
