%ldata = loadjson(['logs/lognewC_39.txt']);
d=ldata.exp5

names=fieldnames(d);
N=length(names);

hold on;
for i=1:N
    t = d.(names{i});
    if numel(t.mapstructure) > 1   
        plotmembership
        for j=1:size(coords,1)
            mapid = -1;
            for k=1:numel(t.mapstructure)
                submap = t.mapstructure{k};
                for l=1:length(submap)
                    if findstr(t.labels{j}, submap{l})
                        mapid = k;
                        break;
                    end;
                end;
                if mapid >= 0
                    break;
                end;
            end;
            text(coords(j, 1)-20, coords(j, 2), ['m ' num2str(mapid)]);
        end;
        break;
    end;
end;

%title([t.mapstructure{1}(:)' '; ' t.mapstructure{2}(:)']');