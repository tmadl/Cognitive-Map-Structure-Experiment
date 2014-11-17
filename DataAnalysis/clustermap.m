%     coords = allcoords{i};
%     colors = allcols{i};
%     labels = alllabels{i};
%     theta = allthetas{i};

functions = [];
for f=1:length(labels)
    if findstr(labels{f}, 'shop')
        functions = [functions 1];
    else
        functions = [functions 0];
    end;
end;

data = [coords/500 colors'/(256^3) functions'];
%data = coords/500;
if length(theta)>1 && sum(isnan(theta)) == 0 %&& false
    fweights = theta(1:3) ./ theta(1); %ignore bias (theta(4))
    %fweights = metatheta(1:3); %ignore bias (theta(4))
else
    fweights = [1 1 1]';
end;

fweights = [fweights(1) ; fweights]; % theta(1) for both x and y coords

%data=randn(100, 3);
%fweights = [1, 1, 1];

N = size(data, 1);
M = size(data, 2);

% 
%Y=pdist(data);
Y=zeros(1, (N^2-N)/2);
y=1;
for d1=1:N
    for d2=(d1+1):N
        dist = 0;
        for f=1:M
            dist = dist + ((data(d2, f) - data(d1, f))*fweights(f))^2;
            %dist = dist + ((data(d2, f) - data(d1, f))*1)^2;
        end;
        Y(y)=sqrt(dist);
        y=y+1;
    end;
end;
% 
% % agglomerative
% L=linkage(Y);
% cluster_memberships = cluster(L, 'cutoff', 0.8); 
% dendrogram(L);

data2 = [];
for i=1:size(data, 2);
    data2 = [data2 data(:, i)*fweights(i)];
end;

% % k means
%[D,eigvals] = cmdscale(Y);
cluster_number = 2; % number of clusters 
%cluster_memberships = kmeans(D, cluster_number);
cluster_memberships = kmeans(data2, cluster_number);

%[D,eigvals] = cmdscale(Y);
% EMGM
%cluster_memberships=emgm(D',2);
%cluster_memberships=emgm(data',2);


cluster_memberships

%title([num2str(fweights(1)) ' ' num2str(fweights(2)) ' ' num2str(fweights(3))])
