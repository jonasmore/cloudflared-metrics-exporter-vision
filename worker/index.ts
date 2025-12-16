export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    
    // Get the asset from the ASSETS binding
    try {
      // Try to fetch the exact path
      let response = await env.ASSETS.fetch(request);
      
      // If not found and it's not a file extension, try index.html (SPA routing)
      if (response.status === 404 && !url.pathname.includes('.')) {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        response = await env.ASSETS.fetch(indexRequest);
      }
      
      return response;
    } catch (error) {
      return new Response('Error loading asset', { status: 500 });
    }
  },
};
