
const topicOrder = ['1', '2', '3', '4'];
const topics = [
    { id: '1', title: 'T1', duration: 10 },
    { id: '2', title: 'T2', duration: 10 },
    { id: '3', title: 'T3', duration: 20 },
    { id: '4', title: 'T4', duration: 45 },
];

function runTest(description: string, scheduleDurationInput: any, topicDurationTransform: (d: any) => any) {
    console.log(`\n--- Test: ${description} ---`);
    let cumulativeMinutes = 0;
    const scheduledMinutes = Number(scheduleDurationInput);
    console.log(`Scheduled Minutes: ${scheduledMinutes} (from ${JSON.stringify(scheduleDurationInput)})`);

    topicOrder.map((id) => {
        const topic = topics.find(t => t.id === id);
        if (!topic) return;

        const duration = topicDurationTransform(topic.duration);

        const prevCumulative = cumulativeMinutes;
        cumulativeMinutes += Number(duration);

        const isOverrunContainer = prevCumulative < scheduledMinutes && cumulativeMinutes > scheduledMinutes;

        console.log(`Topic ${topic.title} (${duration}): prev=${prevCumulative}, cum=${cumulativeMinutes}. Overrun? ${isOverrunContainer}`);
    });
}

// Case 1: All numbers (Ideal)
runTest("All Numbers", 85, d => d);

// Case 2: Schedule is String
runTest("Schedule String '85'", "85", d => d);

// Case 3: Durations are Strings (Pre-fix bug)
// Note: My fix added Number() cast to duration. Before that:
console.log("\n--- Test: Pre-Fix Bug (String Concatenation) ---");
{
    let cumulativeMinutes: any = 0; // Simulate initial number
    const scheduledMinutes = 85;
    topicOrder.map((id) => {
        const topic = topics.find(t => t.id === id);
        //@ts-ignore
        const duration = String(topic?.duration);
        const prevCumulative = cumulativeMinutes;
        cumulativeMinutes += duration; // Concatenation 0 + "10" -> "010"

        const isOverrunContainer = prevCumulative < scheduledMinutes && cumulativeMinutes > scheduledMinutes;
        console.log(`Topic ${topic?.title}: prev=${prevCumulative}, cum=${cumulativeMinutes}. Overrun? ${isOverrunContainer}`);
    });
}

// Case 4: Zero schedule
runTest("Zero Schedule", 0, d => d);

// Case 5: Undefined schedule
runTest("Undefined Schedule", undefined, d => d);
