names=fieldnames(d);
N=length(names);

coords = [];
classes = [];

if ~exist('doplot')
    doplot=1;
end;

if isfield(d.task1, 'dbmembership') && doplot
    figure;
    hold on;
    c='b';
end;
for i=1:N
    if ~strcmp(names{i}, 'last_features')
        t = d.(names{i});
        if isfield(t, 'dbmembership')
            coords = [coords ; t.dbfeatures(1:3)];
            classes = [classes; t.dbmembership];

            if doplot
                c = convertCol(t.real_colors(5));
                if t.dbmembership>0
                    plot3(t.dbfeatures(2), t.dbfeatures(3), t.dbfeatures(1), ['bs'], 'MarkerEdgeColor', c, 'LineWidth', 3);
                else
                    plot3(t.dbfeatures(2), t.dbfeatures(3), t.dbfeatures(1), ['bo'], 'MarkerEdgeColor', c, 'LineWidth', 3);
                end;
            end;
        end;
    end;
end;

datapoints = 0;
loo_error = Inf;
idx = find(classes~=-1);
    n=4;
theta = zeros(n, 1);
if size(coords(idx, :), 1) > 1

    %coords2 = [coords ones(size(coords,1), 1)];
    %coords2(:, 3) = coords2(:, 3) + 1;
    
    datapoints = length(idx);
    
%     initial_theta = zeros(n+1, 1);%zeros(n, 1);
%     %options = optimset('Display', 'off', 'GradObj', 'on', 'maxIter', 1000);
%     %[theta] = fmincg (@(t)(logregCostFunction(t, coords2(idx, :), classes(idx))), initial_theta, options);
     
%       disp('kmeansthetacostfunction')
%       initial_theta = zeros(n, 1);
%       options = optimset('Display', 'off', 'GradObj', 'on', 'maxIter', 100);
%       [theta] = fminsearch (@(t)(kmeansthetacostfunction(t, d)), initial_theta, options);
   
%     model=svm('-t 0');
%     model = model.train(coords(idx, :), classes(idx, :));
%     theta = [];
%     if ~isempty(model.wrappedModel.rho) && ~isempty(model.wrappedModel.sv_coef) && ~isempty(model.wrappedModel.SVs)
%        theta = [model.wrappedModel.rho model.wrappedModel.sv_coef'*model.wrappedModel.SVs]';
%        theta = [theta(2:4) ; theta(1)]; %!
%     end;
 
    theta = mnrfit(coords(idx, :), classes(idx)+1); %!
    theta = [theta(2:4) ; theta(1)]; %!
    
        %loo_error = getLooError(coords(idx, :), classes(idx)+1);

    if doplot
        plot3(0, 0, 0, ['ko'], 'MarkerEdgeColor', 'k', 'LineWidth', 5);
        plot3(1,1,1, ['ks'], 'MarkerEdgeColor', 'k', 'LineWidth', 5);
        
        [col, fun] = meshgrid(0:0.02:1, 0:0.2:1);
        %surf(col, fun, (-theta(2)*col - theta(3)*fun)/theta(1), 'EdgeColor', 'b');
        surf(col, fun, (-theta(2)*col - theta(3)*fun - theta(4))/theta(1), 'EdgeColor', 'b');
        surf(col, fun, (-d.last_features(2)*col - d.last_features(3)*fun)/d.last_features(1), 'EdgeColor', 'r');
        xlabel('color');
        ylabel('function');
        zlabel('distance');
    end;
end;

%d.last_features;
%theta;