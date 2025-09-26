---
date: 2025-06-18
categories:
  - Community
---


# Introducing the Perses MCP Server

We're thrilled to introduce the **Perses MCP Server**, now available in public beta. This new tool empowers you to interact with your Perses instances using natural language, opening up a world of possibilities for monitoring and visualization.

With the Perses MCP Server, users can use AI Agents to understand, query and interact with Perses APIs in a standardized and secure manner. 

Imagine being able to prompt your favorite AI Agent with questions like: 

- "How many dashboards are created in the last 5 days in project 'Test Project'?"
- "What is the default datasource for project 'Test Project'?"
    - "Is this datasource in proxy mode? and what is the URL?" 
- "Analyze this dashboard 'Dashboard A' in project 'Test Project'"
    - Suggest me some improvements to panels and PromQL queries in this dashboard

As you can see, the possibilities are endless. The Perses MCP Server allows you to interact with Perses in ways that were previously not possible.
<!-- more -->
<picture>
  <img alt="Fallback image description" src="https://github.com/user-attachments/assets/416409df-9045-41f3-b10b-91df3020af1f">
</picture>

This diagram visually represents how the Perses MCP Server acts as an intermediary between your AI Agent and the Perses Application.


### What is MCP - The Model Context Protocol Explained

You might be wondering what makes this all possible. The magic behind the scenes is the Model Context Protocol (MCP), an open standard pioneered by Anthropic that is quickly gaining industry-wide adoption. 

MCP’s purpose is to create a universal language for AI agents to interact with the "outside world" that is, any data or system beyond their initial training data. This protocol enables AI to securely access real-time information and perform tasks by connecting to external APIs. In short, MCP provides a paved road for Large Language Models (LLMs) to interact with external systems like databases, APIs, and filesystems.

Major players like Google, Microsoft, and OpenAI have already committed to supporting MCP.


### How to Use the Perses MCP Server

Using the Perses MCP Server is simple and straightforward. 

1. Follow this [User Guide](https://github.com/perses/mcp-server/blob/main/README.md#usage) to install and configure the MCP Server;
2. **Ask a Question**: Pose a natural language question to your favorite AI agent, such as, "When was 'Dashboard A' in 'Project B' last updated?";
3. **Get an Answer**: The MCP Server instantly gets to work, querying the Perses API and delivering the answer back to your AI agent in seconds.

Check out this short demo to see it in action:

<video controls>
  <source src="/assets/images/blog/mcp-server/perses-mcp-server-demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Getting Started with Perses MCP Server

Ready to dive in? Here are the resources you'll need:

- **Perses MCP Server GitHub Repository:** Explore the code, read the documentation, and find the installation instructions [here]( https://github.com/perses/mcp-server);
- **Perses Official Website:** Discover more about the Perses, its features, blog posts and documentation [here](https://perses.dev).


### What's next?

This public beta is just the beginning. Currently, the server supports read-only operations, allowing you to query the Perses API. Our roadmap includes adding write capabilities, which will enable you to use AI agents to create and update Perses resources like dashboards, projects, and datasources.

We are committed to an open development process and we welcome your feedback and contributions as we build these new features. 