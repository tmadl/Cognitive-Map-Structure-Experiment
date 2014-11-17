if ~exist('expno')
    expno = 'exp5';
end;

files=dir('logs');
structuredmapsno = 0;
structuredmaps = {};
alllabels = {};
allcoords = {};
allcols = {};
allthetas = {};
alljsthetas = {};
allthetadatapoints = [];
allcassignments = {};
allconditions = {};
alllooerrors = [];
unstructuredconditions = {};
unstructuredmapsno = 0;
doplot = 0;
z=0;
for fi=3:length(files)
    n = files(fi).name;
    try
        ldata = loadjson(['logs/' n]);
    catch err
        error = 1;
        err
        continue;
    end;
    if isfield(ldata, expno)
        d=ldata.(expno);
        names=fieldnames(d);
        N=length(names);
        structured = 0;
        for i=1:N
            if ~strcmp(names{i}, 'last_features')
                t = d.(names{i});
                z=z+1;
                if isfield(t, 'mapstructure') && numel(t.mapstructure) > 1
                    structured = structured + 1;

                    %for k=1:numel(t.mapstructure)
                        structuredmapsno = structuredmapsno + 1;

                        structuredmaps{structuredmapsno} = t.mapstructure;
                        alllabels{structuredmapsno} = t.labels;
                        allcoords{structuredmapsno} = t.real_coords;
                        allcols{structuredmapsno} = t.real_colors;
                        
                        allcassignments{structuredmapsno} = t.cluster_assignments;
                        allconditions{structuredmapsno} = t.condition;
                        
                        %allthetas{structuredmapsno} = ldata.exp3.last_features;
                        
                        allthetas{structuredmapsno} = [];
                        if isfield(ldata, 'exp3')
                            d = ldata.exp3;
                            gettheta;
                            allthetas{structuredmapsno} = theta;
                            allthetadatapoints(structuredmapsno)=datapoints;
                            alllooerrors(structuredmapsno) = loo_error;
                        end;
                        
                        if isfield(d, 'last_features')
                            alljsthetas{structuredmapsno} = d.last_features;
                        end;
                        
                    %end;
                    
                    %structuredmapsno = structuredmapsno + 1
                    %subplot(3, 4, structuredmaps);
                    %plotstructuredmap
                else
                    unstructuredmapsno = unstructuredmapsno + 1;
                    unstructuredconditions{unstructuredmapsno} = t.condition;
                end;
            end;
        end;
        if ~structured
            disp(['no structure found in any exp5 map in ' n])
        else
            disp(['structure found in ' num2str(structured) ' ' expno ' maps in ' n])
        end;
    end;
end;

% filter out all subjects not having structured more than 75% of the maps
threshold = 0.75*12;
%threshold = 0.5*12;
%threshold = -1;

idx = find(allthetadatapoints > threshold);
structuredmaps = structuredmaps(idx);
alllabels = alllabels(idx);
allcoords = allcoords(idx);
allcols = allcols(idx);
allthetas = allthetas(idx);
alljsthetas = alljsthetas(idx);
allthetadatapoints = allthetadatapoints(idx);
allcassignments = allcassignments(idx);
allconditions = allconditions(idx);
alllooerrors = alllooerrors(idx);

excluded = structuredmapsno - length(structuredmaps)
structuredmapsno = length(structuredmaps);


structuredmapsno