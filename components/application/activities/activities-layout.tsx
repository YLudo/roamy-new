import ActivitiesConfirmed from "./activities-confirmed";
import ActivitiesCost from "./activities-cost";
import ActivitiesList from "./activities-list";
import ActivitiesMap from "./activities-map";
import ActivitiesPending from "./activities-pending";
import ActivitiesTotal from "./activities-total";

interface ActivitiesLayoutProps {
    travel: ITravel;
}

export default function ActivitiesLayout({ travel }: ActivitiesLayoutProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActivitiesTotal activities={travel.activities} />
                <ActivitiesCost activities={travel.activities} />
                <ActivitiesConfirmed activities={travel.activities} />
                <ActivitiesPending activities={travel.activities} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ActivitiesList travel={travel} />
                <ActivitiesMap />
            </div>
        </div>
    );
}