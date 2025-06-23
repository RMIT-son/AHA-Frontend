import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const MarkdownWrapper = ({ content }) => {
    return (
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownWrapper;
