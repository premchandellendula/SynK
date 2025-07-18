export default async function Space({params}: {params: Promise<{spaceId: string}>}){
    const { spaceId } = await params;
    return <div>
        {spaceId}
    </div>
}