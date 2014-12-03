function [ cost ] = kmeansthetacostfunction( theta, expdata )
%KMEANSTHETACOSTFUNCTION Summary of this function goes here
%   Detailed explanation goes here
    d = expdata;

    if length(theta)>1 && sum(isnan(theta)) == 0 && theta(1) ~= 0 %&& false
        fweights = theta(1:3) ./ theta(1); %ignore bias (theta(4))
    else
        fweights = [1 1 1]';
    end;
    fweights = [fweights(1) ; fweights]; % theta(1) for both x and y coords
    
    data = [];
    cluster_number = 2;
    
    names=fieldnames(d);
    N=length(names);
    totalerror = 0;
    for i=1:N
        if ~strcmp(names{i}, 'last_features')
            t = d.(names{i});
            coords = t.real_coords;
            if size(coords, 1) > cluster_number
                colors = t.real_colors;
                functions = getfunctions(t.labels);

                data = [coords/500 colors'/(256^3) functions'];
                wdata = [];
                for i=1:size(data, 2);
                    wdata = [wdata data(:, i)*fweights(i)];
                end;

                cluster_memberships = kmeans(wdata, cluster_number) - 1;
                if cluster_memberships(1) ~= 0
                    cluster_memberships = 1 - cluster_memberships;
                end;

                error = 0;
                if t.dbmembership >= 0
                    error = cluster_memberships(5) ~= t.dbmembership;
                end;
                totalerror = totalerror + error;
            end;
        end;
    end;

    cost = totalerror / (N-1);

end

