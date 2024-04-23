import useSWR from 'swr';
import { cn } from '@/common/utils/Util';
import { GoHistory } from 'react-icons/go';
import FileItem from '@/fronted/components/fileBowser/FileItem';
import React from 'react';
import { WatchProject, WatchProjectType } from '@/backend/db/tables/watchProjects';
import { SWR_KEY, swrMutate } from '@/fronted/lib/swr-util';
import { Button } from '@/fronted/components/ui/button';
import { Trash2 } from 'lucide-react';

const api = window.electron;

export interface ProjectListProps {
    onSelected: (projectId: number) => void;
    className?: string;
}

const ProjectListItem = ({ proj, onSelected }: {
    proj: WatchProject,
    className?: string,
    onSelected: () => void;
}) => {
    const { data: video } = useSWR(['watch-project/video/detail/by-pid', proj.id], ([key, projId]) => api.call('watch-project/video/detail/by-pid', projId));

    const { data: url } = useSWR(video ?
            [SWR_KEY.SPLIT_VIDEO_THUMBNAIL, video.video_path, video.current_time] : null,
        async ([key, path, time]) => {
            return await api.call('split-video/thumbnail', { filePath: path, time });
        }
    );
    console.log('url', url);
    const [hover, setHover] = React.useState(false);
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onSelected}
            className={cn('flex gap-6 hover:bg-muted p-4 rounded-xl')}>
            <img
                src={url}
                style={{
                    aspectRatio: '16/9'
                }}
                className="w-40 object-cover rounded-lg"
                alt={proj.project_name}
            />
            <div
                className={'flex-1 w-0 line-clamp-2 break-words h-fit'}
            >{proj.project_name}</div>
            <Button
                className={cn('w-6 h-6 bg-background self-center', !hover && 'scale-0')}
                size={'icon'}
                variant={'outline'}
                onClick={async (e) => {
                    e.stopPropagation();
                    console.log('swrdelete', proj.id);
                    await api.call('watch-project/delete', proj.id);
                    await swrMutate(SWR_KEY.WATCH_PROJECT_LIST);
                }}
            >
                <Trash2
                    className={'w-3 h-3'}
                />
            </Button>
        </div>
    );


};

export default ProjectListItem;
