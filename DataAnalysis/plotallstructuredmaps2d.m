%ldata = loadjson(['logs/lognewC_39.txt']);
%d=ldata.exp5

if ~exist('structuredmapsno')
    getstructuredmaps;
end;

w = ceil(sqrt(structuredmapsno));

figure;
for i=1:structuredmapsno
    subplot(w, w, i);
    hold on;
    smaps = structuredmaps{i};
    coords = allcoords{i};
    colors = allcols{i};
    labels = alllabels{i};
    for j=1:size(coords,1)
        mapid = -1;
        for k=1:numel(smaps)
            submap = smaps{k};
            if ~isnumeric(submap)
                if iscell(submap)
                    for l=1:length(submap)
                        if findstr(labels{j}, submap{l})
                            mapid = k;
                            break;
                        end;
                    end;
                else
                    if findstr(labels{j}, submap)
                        mapid = k;
                        break;
                    end;
                end;
            end;
            if mapid >= 0
                break;
            end;
        end;
        if findstr(labels{j}, 'house')
            s='o';
        else
            s='s';
        end;
        scatter(coords(j, 1), coords(j, 2), 40, convertCol(colors(j)), s, 'LineWidth', 3);
        text(coords(j, 1)-20, coords(j, 2)-35, ['m ' num2str(mapid)]);
    end;
end;

%title([t.mapstructure{1}(:)' '; ' t.mapstructure{2}(:)']');