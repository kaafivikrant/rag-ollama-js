export function combineDocuments(retrievedDocs: { pageContent: string }[]) {
    return retrievedDocs.map((doc: { pageContent: string }) => doc.pageContent).join("\n");
}