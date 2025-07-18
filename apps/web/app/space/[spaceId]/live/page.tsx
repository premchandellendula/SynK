export default async function Live({params}: {params: Promise<{spaceId: string}>}){
    const { spaceId } = await params;

    return (
        <div>
            {spaceId}
        </div>
    )
}