import * as React from "react";

interface Resource {
  title: string;
  url: string;
  platform: string;
  icon: string;
}

interface TopicInfo {
  subject: string;
  topic: string;
  level: string;
  keywords: string[];
}

interface ResourcePanelProps {
  topicInfo: TopicInfo;
  resources: {
    videos: Resource[];
    exercises: Resource[];
    interactive: Resource[];
    reference: Resource[];
  };
  onClose: () => void;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({
  topicInfo,
  resources,
  onClose,
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            📚 Recursos Educativos
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            {topicInfo.subject} • {topicInfo.level}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          title="Cerrar panel"
        >
          <span className="text-2xl">×</span>
        </button>
      </div>

      {/* Topic Badge */}
      <div className="mb-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
        <p className="text-purple-200 text-sm font-medium">
          Tema detectado: <span className="text-white">{topicInfo.topic}</span>
        </p>
        {topicInfo.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {topicInfo.keywords.map((keyword, i) => (
              <span
                key={i}
                className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded"
              >
                #{keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Videos */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
          <span>📺</span> Videos
        </h4>
        <ul className="space-y-2">
          {resources.videos.map((resource, i) => (
            <li key={i}>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 hover:underline text-sm flex items-start gap-2"
              >
                <span>{resource.icon}</span>
                <span>{resource.title}</span>
              </a>
              <span className="text-gray-500 text-xs ml-6">
                {resource.platform}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ejercicios */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
          <span>📝</span> Ejercicios
        </h4>
        <ul className="space-y-2">
          {resources.exercises.map((resource, i) => (
            <li key={i}>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 hover:underline text-sm flex items-start gap-2"
              >
                <span>{resource.icon}</span>
                <span>{resource.title}</span>
              </a>
              <span className="text-gray-500 text-xs ml-6">
                {resource.platform}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Interactivos */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
          <span>🎮</span> Interactivos
        </h4>
        <ul className="space-y-2">
          {resources.interactive.map((resource, i) => (
            <li key={i}>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 hover:underline text-sm flex items-start gap-2"
              >
                <span>{resource.icon}</span>
                <span>{resource.title}</span>
              </a>
              <span className="text-gray-500 text-xs ml-6">
                {resource.platform}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Referencias */}
      <div>
        <h4 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <span>📖</span> Referencias
        </h4>
        <ul className="space-y-2">
          {resources.reference.map((resource, i) => (
            <li key={i}>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 hover:underline text-sm flex items-start gap-2"
              >
                <span>{resource.icon}</span>
                <span>{resource.title}</span>
              </a>
              <span className="text-gray-500 text-xs ml-6">
                {resource.platform}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
