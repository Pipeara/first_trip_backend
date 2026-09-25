export async function addRideStatusHistory(
    client,
    {
        rideId,
        status,
        changedBy = null
    }
) {
    await client.query(
        `
        INSERT INTO ride_status_history (
            ride_id,
            status,
            changed_by
        )
        VALUES ($1, $2, $3)
        `,
        [
            rideId,
            status,
            changedBy
        ]
    );
}